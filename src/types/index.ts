export interface ApiResponse<T> {
  data: T[];
  meta: {
    itemCount: number;
    pageCount: number;
  };
}

export interface GenericResponse {
  message: string;
}
