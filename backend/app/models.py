from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone



class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)
    is_active: bool = Field(default=True)
    is_admin: bool = Field(default=False)


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str


class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


class ProductBase(SQLModel):
    name: str = Field(index=True)
    sku: str = Field(unique=True, index=True) 
    quantity: int = Field(ge=0) 
    price: float = Field(ge=0.0) 
    category: str = Field(default="Uncategorized")
    description: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(SQLModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    quantity: Optional[int] = None
    price: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None


class Product(ProductBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # arhiving and soft deleting
    is_archived: bool = Field(default=False) 
    
    #for timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductRead(ProductBase):
    id: int
    is_archived: bool
    created_at: datetime
    updated_at: datetime