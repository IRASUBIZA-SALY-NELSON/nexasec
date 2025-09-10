from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from app.models.report import  ReportType, ReportFormat
from datetime import datetime
import json
import os
import hashlib
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
import docx
from docx.shared import Inches
import csv
import tempfile
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from fastapi import HTTPException, status
from app.core.config import settings

from app.models.report import (
    ReportCreate,
    ReportInDB,
    ReportTemplateCreate,
    ReportTemplateInDB,
    ReportStatus
)

class ReportGenerator:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.jinja_env = Environment(
            loader=FileSystemLoader(settings.TEMPLATE_STORAGE_PATH)
        )

    async def create_report(
        self,
        user_id: str,
        report_create: ReportCreate
    ) -> ReportInDB:
        """Create a new report."""
        # Create report document
        report_dict = report_create.model_dump()
        report_dict["user_id"] = ObjectId(user_id)
        report_dict["status"] = ReportStatus.PENDING
        report_dict["created_at"] = datetime.utcnow()
        report_dict["updated_at"] = datetime.utcnow()

        if report_create.template_id:
            report_dict["template_id"] = ObjectId(report_create.template_id)
        report_dict["source_id"] = ObjectId(report_create.source_id)

        # Insert into database
        result = await self.db["reports"].insert_one(report_dict)
        report_dict["_id"] = result.inserted_id

        # Create report object
        report = ReportInDB(**report_dict)

        # Generate report in background
        await self._generate_report(str(report.id))

        return report

    async def _generate_report(self, report_id: str) -> None:
        """Generate the report."""
        try:
            # Get report from database
            report_dict = await self.db["reports"].find_one({"_id": ObjectId(report_id)})
            if not report_dict:
                return

            # Update status to generating
            await self.db["reports"].update_one(
                {"_id": ObjectId(report_id)},
                {
                    "$set": {
                        "status": ReportStatus.GENERATING,
                        "updated_at": datetime.utcnow()
                    }
                }
            )

            report = ReportInDB(**report_dict)
            start_time = datetime.utcnow()

            # Get source data
            source_data = await self._get_source_data(report)

            # Get template
            template = await self._get_template(report)

            # Generate content
            content = await self._generate_content(template, source_data, report)

            # Generate file based on format
            file_path = await self._generate_file(report.format, content, report_id)

            # Calculate file hash and size
            file_hash = await self._calculate_file_hash(file_path)
            file_size = os.path.getsize(file_path)

            # Update report status
            generation_time = (datetime.utcnow() - start_time).total_seconds()
            await self.db["reports"].update_one(
                {"_id": ObjectId(report_id)},
                {
                    "$set": {
                        "status": ReportStatus.COMPLETED,
                        "file_path": file_path,
                        "file_hash": file_hash,
                        "file_size": file_size,
                        "generation_time": generation_time,
                        "updated_at": datetime.utcnow()
                    }
                }
            )

        except Exception as e:
            # Update status to failed
            await self.db["reports"].update_one(
                {"_id": ObjectId(report_id)},
                {
                    "$set": {
                        "status": ReportStatus.FAILED,
                        "error_message": str(e),
                        "updated_at": datetime.utcnow()
                    }
                }
            )

    async def _get_source_data(self, report: ReportInDB) -> Dict[str, Any]:
        """Get data from the report source."""
        if report.report_type == ReportType.SCAN:
            return await self._get_scan_data(report.source_id)
        elif report.report_type == ReportType.PENTEST:
            return await self._get_pentest_data(report.source_id)
        else:
            raise ValueError(f"Unsupported report type: {report.report_type}")

    async def _get_scan_data(self, scan_id: ObjectId) -> Dict[str, Any]:
        """Get scan data for report."""
        scan = await self.db["scans"].find_one({"_id": scan_id})
        if not scan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scan not found"
            )

        vulnerabilities = await self.db["vulnerabilities"].find(
            {"scan_id": scan_id}
        ).to_list(length=None)

        return {
            "scan": scan,
            "vulnerabilities": vulnerabilities
        }

    async def _get_pentest_data(self, pentest_id: ObjectId) -> Dict[str, Any]:
        """Get pentest data for report."""
        pentest = await self.db["pentests"].find_one({"_id": pentest_id})
        if not pentest:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Penetration test not found"
            )

        findings = await self.db["findings"].find(
            {"pentest_id": pentest_id}
        ).to_list(length=None)

        return {
            "pentest": pentest,
            "findings": findings
        }

    async def _get_template(self, report: ReportInDB) -> ReportTemplateInDB:
        """Get report template."""
        if report.template_id:
            template = await self.db["report_templates"].find_one(
                {"_id": report.template_id}
            )
            if not template:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Report template not found"
                )
            return ReportTemplateInDB(**template)
        else:
            # Get default template for report type
            template = await self.db["report_templates"].find_one({
                "report_type": report.report_type,
                "is_default": True
            })
            if not template:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No default template found for report type"
                )
            return ReportTemplateInDB(**template)

    async def _generate_content(
        self,
        template: ReportTemplateInDB,
        data: Dict[str, Any],
        report: ReportInDB
    ) -> Dict[str, Any]:
        """Generate report content using template."""
        content = {
            "title": report.title,
            "description": report.description,
            "generated_at": datetime.utcnow(),
            "data": data
        }

        if report.include_executive_summary:
            content["executive_summary"] = self._generate_executive_summary(data)

        if report.include_technical_details:
            content["technical_details"] = self._generate_technical_details(data)

        if report.include_remediation_plan:
            content["remediation_plan"] = self._generate_remediation_plan(data)

        if report.custom_fields:
            content.update(report.custom_fields)

        return content

    def _generate_executive_summary(self, data: Dict[str, Any]) -> str:
        """Generate executive summary."""
        # Implement executive summary generation
        pass

    def _generate_technical_details(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate technical details section."""
        # Implement technical details generation
        pass

    def _generate_remediation_plan(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate remediation plan."""
        # Implement remediation plan generation
        pass

    async def _generate_file(
        self,
        format: ReportFormat,
        content: Dict[str, Any],
        report_id: str
    ) -> str:
        """Generate report file in specified format."""
        if format == ReportFormat.PDF:
            return await self._generate_pdf(content, report_id)
        elif format == ReportFormat.HTML:
            return await self._generate_html(content, report_id)
        elif format == ReportFormat.DOCX:
            return await self._generate_docx(content, report_id)
        elif format == ReportFormat.JSON:
            return await self._generate_json(content, report_id)
        elif format == ReportFormat.CSV:
            return await self._generate_csv(content, report_id)
        else:
            raise ValueError(f"Unsupported format: {format}")

    async def _generate_pdf(self, content: Dict[str, Any], report_id: str) -> str:
        """Generate PDF report."""
        html_content = self._render_template("pdf.html", content)
        output_path = os.path.join(settings.REPORT_STORAGE_PATH, f"{report_id}.pdf")
        HTML(string=html_content).write_pdf(output_path)
        return output_path

    async def _generate_html(self, content: Dict[str, Any], report_id: str) -> str:
        """Generate HTML report."""
        html_content = self._render_template("html.html", content)
        output_path = os.path.join(settings.REPORT_STORAGE_PATH, f"{report_id}.html")
        with open(output_path, "w") as f:
            f.write(html_content)
        return output_path

    async def _generate_docx(self, content: Dict[str, Any], report_id: str) -> str:
        """Generate DOCX report."""
        doc = docx.Document()
        # Implement DOCX generation
        output_path = os.path.join(settings.REPORT_STORAGE_PATH, f"{report_id}.docx")
        doc.save(output_path)
        return output_path

    async def _generate_json(self, content: Dict[str, Any], report_id: str) -> str:
        """Generate JSON report."""
        output_path = os.path.join(settings.REPORT_STORAGE_PATH, f"{report_id}.json")
        with open(output_path, "w") as f:
            json.dump(content, f, default=str)
        return output_path

    async def _generate_csv(self, content: Dict[str, Any], report_id: str) -> str:
        """Generate CSV report."""
        output_path = os.path.join(settings.REPORT_STORAGE_PATH, f"{report_id}.csv")
        flattened_data = self._flatten_data_for_csv(content)
        with open(output_path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=flattened_data[0].keys())
            writer.writeheader()
            writer.writerows(flattened_data)
        return output_path

    def _flatten_data_for_csv(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Flatten nested data structure for CSV format."""
        # Implement data flattening for CSV
        pass

    def _render_template(self, template_name: str, content: Dict[str, Any]) -> str:
        """Render template with content."""
        template = self.jinja_env.get_template(template_name)
        return template.render(**content)

    async def _calculate_file_hash(self, file_path: str) -> str:
        """Calculate SHA-256 hash of file."""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    async def get_report(self, report_id: str) -> Optional[ReportInDB]:
        """Get report by ID."""
        if not ObjectId.is_valid(report_id):
            return None
        report_dict = await self.db["reports"].find_one({"_id": ObjectId(report_id)})
        return ReportInDB(**report_dict) if report_dict else None

    async def create_template(
        self,
        user_id: Optional[str],
        template_create: ReportTemplateCreate
    ) -> ReportTemplateInDB:
        """Create a new report template."""
        template_dict = template_create.model_dump()
        if user_id:
            template_dict["user_id"] = ObjectId(user_id)
        template_dict["created_at"] = datetime.utcnow()
        template_dict["updated_at"] = datetime.utcnow()

        result = await self.db["report_templates"].insert_one(template_dict)
        template_dict["_id"] = result.inserted_id

        return ReportTemplateInDB(**template_dict)

    async def get_template(self, template_id: str) -> Optional[ReportTemplateInDB]:
        """Get template by ID."""
        if not ObjectId.is_valid(template_id):
            return None
        template_dict = await self.db["report_templates"].find_one(
            {"_id": ObjectId(template_id)}
        )
        return ReportTemplateInDB(**template_dict) if template_dict else None

    async def list_templates(
        self,
        report_type: Optional[ReportType] = None,
        user_id: Optional[str] = None,
        include_public: bool = True
    ) -> List[ReportTemplateInDB]:
        """List available templates."""
        query = {}
        if report_type:
            query["report_type"] = report_type
        if user_id:
            if include_public:
                query["$or"] = [
                    {"user_id": ObjectId(user_id)},
                    {"is_public": True}
                ]
            else:
                query["user_id"] = ObjectId(user_id)
        elif not include_public:
            return []

        templates = await self.db["report_templates"].find(query).to_list(length=None)
        return [ReportTemplateInDB(**t) for t in templates] 