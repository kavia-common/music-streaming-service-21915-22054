from pydantic import BaseModel, Field


class StreamStartRequest(BaseModel):
    trackId: str = Field(..., description="ID of track to stream")


class StreamStopRequest(BaseModel):
    sessionId: int = Field(..., description="Streaming session id")


class StreamStartResponse(BaseModel):
    session_id: int = Field(..., description="Streaming session id")
    track_id: str = Field(..., description="Track id")
    stream_url: str = Field(..., description="URL to stream media")
