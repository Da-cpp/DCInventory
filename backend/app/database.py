# from sqlmodel import create_engine, Session

# DATABASE_URL = "postgresql://user:password@localhost:5432/resilience_db"
# engine = create_engine(DATABASE_URL)

# def get_session():
#     with Session(engine) as session:
#         yield session

from sqlmodel import create_engine, Session, SQLModel

DATABASE_URL = "postgresql://postgres:postgres@postgres_db:5432/resilience_db"
engine = create_engine(DATABASE_URL, echo=True) 

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session