import React, { useState } from "react";
import { useRouter } from "next/router";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { SearchIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { t } = useTranslation("common");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex w-full max-w-sm items-center space-x-2"
    >
      <Input
        type="text"
        placeholder={t("search.placeholder")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Button type="submit" size="icon">
        <SearchIcon className="h-4 w-4" />
      </Button>
    </form>
  );
};
