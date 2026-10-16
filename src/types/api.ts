export type Locale = "en" | "pt-BR";
export type ProductStatus = "PUBLISHED" | "COMING_SOON";
export type Role = "USER" | "ADMIN";

export type TopicRef = { id: string; name: string; slug: string };
export type Topic = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  position: number;
  productCount: number;
};

export type ProductListItem = {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  status: ProductStatus;
  upvotes: number;
  topics: TopicRef[];
  review: { rating: number } | null;
};

export type ProductDetail = ProductListItem & {
  longDescription: string | null;
  createdAt: string;
  review: { rating: number; summary: string } | null;
};

export type VoteResult = { upvotes: number; voted: boolean };
export type Me = { id: string; role: Role };
export type MyVotes = { productIds: string[] };

export type ApiError = {
  error: { code: string; status: number; message: string; requestId: string; details?: unknown };
};

export type AdminProduct = ProductListItem & { createdAt: string; updatedAt: string };

export type ProductInput = {
  title: string;
  description: string;
  longDescription: string | null;
  url: string;
  imageUrl: string | null;
  status: ProductStatus;
  topicIds: string[];
};

export type ReviewInput = { rating: number; summary: string };

export type TopicTranslation = { name: string; description: string | null };
export type TopicInput = { translations: Record<Locale, TopicTranslation> };

export type FieldErrorDetail = { field: string; code: string };
export type TopicInUseDetails = { products: { productId: string; title: string }[]; total: number };
