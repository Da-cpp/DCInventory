from fastapi import FastAPI, Depends, HTTPException, status, Query
from sqlmodel import SQLModel, Session, select
from contextlib import asynccontextmanager
from typing import List, Optional
from datetime import datetime, timezone

from app.database import engine, get_session 
from app.models import (
    User, 
    UserRead, 
    UserCreate as UserCreateSchema, # renamed to avoid clash with class
    Token, 
    Product, 
    ProductRead, 
    ProductCreate, 
    ProductUpdate
)
from app.auth import (
    verify_password, 
    create_access_token, 
    get_password_hash, 
    get_current_user
)
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError
from pydantic import BaseModel, Field
from sqlalchemy.exc import SQLAlchemyError


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating database tables if they don't exist...")
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(lifespan=lifespan)



class UserRegisterInput(BaseModel):
    username: str
    password: str = Field(..., max_length=72)
    email: str

@app.get("/")
def read_root():
    return {"message": "Server is up and running"}

@app.post("/register", response_model=UserRead)
def register_user(user_in: UserRegisterInput, session: Session = Depends(get_session)):
    
    existing_user = session.exec(
        select(User).where((User.username == user_in.username) | (User.email == user_in.email))
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered."
        )

    hashed_password = get_password_hash(user_in.password)
    
    db_user = User(
        username=user_in.username, 
        email=user_in.email, 
        hashed_password=hashed_password,
    )
    
    try:
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user
    except Exception:
        session.rollback()
        raise HTTPException(status_code=500, detail="Error during user registration.")


@app.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    session: Session = Depends(get_session)
):
    
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}



@app.get("/items/", response_model=List[ProductRead])
def read_products(
    category: Optional[str] = Query(None, description="Filter by product category"),
    is_archived: bool = Query(False, description="Include archived items"),
    session: Session = Depends(get_session), 
    user: User = Depends(get_current_user) 
):
    
    query = select(Product)
    
   
    if not is_archived:
        query = query.where(Product.is_archived == False)
        
    if category:
        query = query.where(Product.category == category)
        
    products = session.exec(query).all()
    return products


@app.post("/items/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(
    product: ProductCreate, 
    session: Session = Depends(get_session), 
    user: User = Depends(get_current_user) 
):
    db_product = Product.model_validate(product)
    
    try:
        session.add(db_product)
        session.commit()
        session.refresh(db_product)
        return db_product
    except Exception:
        session.rollback()
        raise HTTPException(status_code=400, detail="SKU already exists or invalid data.")


@app.patch("/items/{item_id}", response_model=ProductRead)
def update_product(
    item_id: int, 
    product_update: ProductUpdate, 
    session: Session = Depends(get_session), 
    user: User = Depends(get_current_user) #requires authentication
):
    
    db_product = session.get(Product, item_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    
    update_data = product_update.model_dump(exclude_unset=True)

    db_product.sqlmodel_update(update_data)

    db_product.updated_at = datetime.now(timezone.utc)
    
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product

# @app.put("/items/{item_id}", response_model=ProductRead)
# def replace_product(
#     item_id: int, 
#     product_in: ProductCreate, 
#     session: Session = Depends(get_session), 
#     user: User = Depends(get_current_user) # requires authentication
# ):

#     db_product = session.get(Product, item_id)
#     if not db_product:
#         raise HTTPException(status_code=404, detail="Product not found")

#     db_product.model_validate(product_in, update=True)
#     db_product.updated_at = datetime.now(timezone.utc)

#     session.add(db_product)
#     session.commit()
#     session.refresh(db_product)
#     return db_product


@app.patch("/items/{item_id}/archive", response_model=ProductRead)
def toggle_archive(
    item_id: int, 
    session: Session = Depends(get_session), 
    user: User = Depends(get_current_user) # requires authentication
):
    db_product = session.get(Product, item_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")


    db_product.is_archived = not db_product.is_archived

    db_product.updated_at = datetime.now(timezone.utc)
    
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product


@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def hard_delete_product(
    item_id: int, 
    session: Session = Depends(get_session), 
    user: User = Depends(get_current_user) # Requires authentication
):
    
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Forbidden: Requires administrator privileges for permanent deletion."
        )

    db_product = session.get(Product, item_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    session.delete(db_product)
    session.commit()
    return {"detail": "Product permanently deleted"}