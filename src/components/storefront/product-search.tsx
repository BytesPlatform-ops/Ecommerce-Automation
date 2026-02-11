'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
}

interface ProductSearchProps {
  products: Product[];
  productPath: string;
}

export function ProductSearch({ products, productPath }: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef(0);

  // Prevent scroll jumping when dropdown renders/unrenders
  useLayoutEffect(() => {
    scrollYRef.current = window.scrollY;
    
    const timer = requestAnimationFrame(() => {
      if (window.scrollY !== scrollYRef.current) {
        window.scrollTo(0, scrollYRef.current);
      }
    });

    return () => cancelAnimationFrame(timer);
  }, [isOpen, filteredProducts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
      setIsOpen(true);
    } else {
      setFilteredProducts([]);
      setIsOpen(false);
    }
  }, [searchQuery, products]);

  const handleClear = () => {
    setSearchQuery('');
    setFilteredProducts([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full" style={{ overflowAnchor: 'none', scrollbarGutter: 'stable' }}>
      <div className="relative">
        <div className="absolute inset-y-0 left-3.5 flex items-center text-muted-foreground">
          <Search className="h-4 w-4 -mt-0.5" strokeWidth={1.5} />
        </div>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.trim() && setIsOpen(true)}
          style={{ overflowAnchor: 'none' }}
          className="w-full pl-10 pr-9 py-3 bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-200"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors duration-200 pointer-events-auto"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {isOpen && filteredProducts.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border shadow-lg z-50 max-h-80 overflow-y-auto" style={{ overflowAnchor: 'none', scrollbarGutter: 'stable' }}>
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`${productPath}/${product.id}`}
              onClick={() => {
                setSearchQuery('');
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted border-b border-border last:border-b-0 transition-colors duration-200"
            >
              <div className="relative w-10 h-12 flex-shrink-0 bg-muted overflow-hidden">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground">No img</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm text-foreground truncate">
                  {product.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  ${Number(product.price).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isOpen && searchQuery.trim() && filteredProducts.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border shadow-lg z-50 p-4 text-center" style={{ overflowAnchor: 'none', scrollbarGutter: 'stable' }}>
          <p className="text-sm text-muted-foreground">No products found matching &ldquo;{searchQuery}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
