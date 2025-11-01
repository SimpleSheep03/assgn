"""
Database models and initialization for Call Scheduler
Uses SQLite for simplicity and minimal setup
"""

from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

Base = declarative_base()

# Database setup
DATABASE_URL = 'sqlite:///call_scheduler.db'
engine = create_engine(DATABASE_URL, connect_args={'check_same_thread': False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class ScheduledCall(Base):
    """Model for scheduled calls"""
    __tablename__ = 'scheduled_calls'
    
    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(String, default='pending')  # pending, executed, failed
    created_at = Column(DateTime, default=datetime.now)
    executed_at = Column(DateTime, nullable=True)
    call_id = Column(String, nullable=True)  # ID from Call API after execution


class CallHistory(Base):
    """Model for call history (executed calls)"""
    __tablename__ = 'call_history'
    
    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(String, nullable=False)  # ID from Call API
    phone_number = Column(String, nullable=False)
    status = Column(String, default='initiated')
    scheduled_time = Column(DateTime, nullable=False)
    executed_at = Column(DateTime, default=datetime.now)


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized")


def get_db_session():
    """Get database session"""
    return SessionLocal()

