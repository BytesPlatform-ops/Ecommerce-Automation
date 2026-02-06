'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
}

interface NavbarSearchProps {
  products: Product[];
  productPath: string;
}

export function NavbarSearch({ products, productPath }: NavbarSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div ref={searchRef} className="relative w-44 sm:w-56 lg:w-64">
      <div className="relative">
        <div className="absolute left-3 top-3">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.trim() && setIsOpen(true)}
          className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && filteredProducts.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {filteredProducts.slice(0, 8).map((product) => (
            <Link
              key={product.id}
              href={`${productPath}/${product.id}`}
              onClick={() => {
                setSearchQuery('');
                setIsOpen(false);
              }}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="relative w-12 h-12 flex-shrink-0 rounded-md bg-gray-100 overflow-hidden">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <span className="text-xs text-gray-400">No img</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 truncate">
                  {product.name}
                </h3>
                <p className="text-xs font-medium text-blue-600">
                  ${Number(product.price).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isOpen && searchQuery.trim() && filteredProducts.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 text-center">
          <p className="text-sm text-gray-500">No products found</p>
        </div>
      )}
    </div>
  );
}
