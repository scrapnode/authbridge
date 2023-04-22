export const ok = (response: Record<string, any>) => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(response),
  };
};

export const error400 = (message: string, args?: object) => {
  return {
    statusCode: 400,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, ...args }),
  };
};

export const error401 = (message = "Unauthorized request", args?: object) => {
  return {
    statusCode: 401,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, ...args }),
  };
};

export const error404 = (message = "resource is not found", args?: object) => {
  return {
    statusCode: 404,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, ...args }),
  };
};

export const error500 = (
  message = "oops, something went wrong",
  args?: object
) => {
  return {
    statusCode: 500,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, ...args }),
  };
};
