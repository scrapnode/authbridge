export const ok = (response: Record<string, any>) => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(response),
  };
};

export const error400 = (message: string) => {
  return {
    statusCode: 400,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  };
};

export const error401 = (message = "Unauthorized request") => {
  return {
    statusCode: 401,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  };
};

export const error404 = (message = "resource is not found") => {
  return {
    statusCode: 404,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  };
};

export const error500 = (message = "oops, something went wrong") => {
  return {
    statusCode: 500,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  };
};
