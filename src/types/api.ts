export type Locale = "en" | "pt-BR";
export type ProductStatus = "PUBLISHED" | "COMING_SOON"; // in the query: ?status=coming-soon
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
  review: { rating: number } | null; // no hasVoted: computed on the client from GET /api/me/votes
};

export type ProductDetail = ProductListItem & {
  longDescription: string | null;
  createdAt: string;
  review: { rating: number; summary: string } | null;
};

export type VoteResult = { upvotes: number; voted: boolean }; // POST /api/products/:id/vote
export type Me = { id: string; role: Role }; // GET /api/me
export type MyVotes = { productIds: string[] }; // GET /api/me/votes

export type ApiError = {
  error: { code: string; status: number; message: string; requestId: string; details?: unknown };
};
