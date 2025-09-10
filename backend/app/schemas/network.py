from pydantic import BaseModel
from enum import Enum
from typing import List, Optional

class NodeType(str, Enum):
    host = "host"
    device = "device"
    service = "service"

class NodeStatus(str, Enum):
    up = "up"
    down = "down"
    unknown = "unknown"

class NetworkNode(BaseModel):
    id: str
    type: NodeType
    name: str
    ip: Optional[str] = None
    status: NodeStatus

class ConnectionType(str, Enum):
    direct = "direct"
    indirect = "indirect"

class NetworkConnection(BaseModel):
    source: str
    target: str
    type: ConnectionType

class NetworkMap(BaseModel):
    nodes: List[NetworkNode]
    connections: List[NetworkConnection] 