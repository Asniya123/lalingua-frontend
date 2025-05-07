import React, { useState, useEffect, ChangeEvent } from "react";
import { Input } from "@nextui-org/react";
import { SearchIcon } from "lucide-react";
import { cn } from "../../utils/lib"; // ✅ Make sure this path is correct

interface SearchInputProps {
  onSearch: (value: string) => void;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearch, className }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedValue, setDebouncedValue] = useState<string>(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchTerm);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 50) {
      setSearchTerm(value);
    } else {
      alert("Search term cannot exceed 50 characters.");
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Input
        placeholder="Search..."
        value={searchTerm}
        onChange={handleChange}
        startContent={<SearchIcon />}
      />
    </div>
  );
};

export default SearchInput;
