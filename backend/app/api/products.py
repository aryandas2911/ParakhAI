from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, field_validator
from typing import Optional
from app.core.auth import get_current_user
from app.core.supabase import get_supabase_client

router = APIRouter(prefix="/api/products", tags=["products"])


class ProductCreateRequest(BaseModel):
    product_name: str
    category: str
    manufacturer: str

    @field_validator("product_name")
    @classmethod
    def validate_product_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 1:
            raise ValueError("Product name cannot be empty.")
        if len(v) > 255:
            raise ValueError("Product name must be at most 255 characters.")
        return v

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 1:
            raise ValueError("Category cannot be empty.")
        if len(v) > 100:
            raise ValueError("Category must be at most 100 characters.")
        return v

    @field_validator("manufacturer")
    @classmethod
    def validate_manufacturer(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 1:
            raise ValueError("Manufacturer cannot be empty.")
        if len(v) > 255:
            raise ValueError("Manufacturer must be at most 255 characters.")
        return v


class ProductUpdateRequest(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    manufacturer: Optional[str] = None

    @field_validator("product_name")
    @classmethod
    def validate_product_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) < 1:
                raise ValueError("Product name cannot be empty.")
            if len(v) > 255:
                raise ValueError("Product name must be at most 255 characters.")
        return v

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) < 1:
                raise ValueError("Category cannot be empty.")
            if len(v) > 100:
                raise ValueError("Category must be at most 100 characters.")
        return v

    @field_validator("manufacturer")
    @classmethod
    def validate_manufacturer(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) < 1:
                raise ValueError("Manufacturer cannot be empty.")
            if len(v) > 255:
                raise ValueError("Manufacturer must be at most 255 characters.")
        return v


class ProductResponse(BaseModel):
    product_id: str
    product_name: str
    category: str
    manufacturer: str
    created_at: str
    updated_at: str


def _row_to_response(row: dict) -> ProductResponse:
    return ProductResponse(
        product_id=row["product_id"],
        product_name=row["product_name"],
        category=row["category"],
        manufacturer=row["manufacturer"],
        created_at=str(row["created_at"]),
        updated_at=str(row["updated_at"]),
    )


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    body: ProductCreateRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a new product. Requires authentication."""
    client = get_supabase_client()

    try:
        result = (
            client.table("products")
            .insert({
                "product_name": body.product_name,
                "category": body.category,
                "manufacturer": body.manufacturer,
            })
            .execute()
        )
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create product.",
            )
        return _row_to_response(result.data[0])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create product: {str(exc)}",
        )


@router.get("", response_model=list[ProductResponse])
async def list_products(
    search: Optional[str] = Query(None, description="Search by product name"),
    current_user: dict = Depends(get_current_user),
):
    """List products with optional name search. Requires authentication."""
    client = get_supabase_client()

    try:
        query = client.table("products").select("*")
        if search:
            query = query.ilike("product_name", f"%{search}%")
        query = query.order("created_at", desc=True)
        result = query.execute()
        return [_row_to_response(row) for row in result.data]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list products: {str(exc)}",
        )


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a single product by ID. Requires authentication."""
    client = get_supabase_client()

    try:
        result = (
            client.table("products")
            .select("*")
            .eq("product_id", product_id)
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found.",
            )
        return _row_to_response(result.data)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch product: {str(exc)}",
        )


@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    body: ProductUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update a product. Requires authentication."""
    client = get_supabase_client()

    updates = {}
    if body.product_name is not None:
        updates["product_name"] = body.product_name
    if body.category is not None:
        updates["category"] = body.category
    if body.manufacturer is not None:
        updates["manufacturer"] = body.manufacturer

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update.",
        )

    try:
        result = (
            client.table("products")
            .update(updates)
            .eq("product_id", product_id)
            .execute()
        )
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found.",
            )
        return _row_to_response(result.data[0])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update product: {str(exc)}",
        )
