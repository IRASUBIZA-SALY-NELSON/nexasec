#!/usr/bin/env python3
"""
Test script to verify network discovery service fixes.
"""
import asyncio
import sys
import os
from motor.motor_asyncio import AsyncIOMotorClient

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.services.network_discovery import NetworkDiscoveryService
from app.core.config import settings

async def test_network_discovery():
    """Test the network discovery service functionality."""
    print("Testing Network Discovery Service...")
    
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.DATABASE_NAME]
        
        # Create network discovery service
        service = NetworkDiscoveryService(db)
        
        print("✓ Network discovery service created successfully")
        
        # Test get_discovered_devices method
        devices = await service.get_discovered_devices()
        print(f"✓ get_discovered_devices() returned {len(devices)} devices")
        
        # Test get_network_map method
        network_map = await service.get_network_map()
        print(f"✓ get_network_map() returned {len(network_map.get('nodes', []))} nodes and {len(network_map.get('connections', []))} connections")
        
        # Test local network detection
        networks = await service._get_local_networks()
        print(f"✓ _get_local_networks() detected {len(networks)} networks: {networks}")
        
        print("\n🎉 All network discovery service tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        # Close database connection
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    success = asyncio.run(test_network_discovery())
    sys.exit(0 if success else 1)
