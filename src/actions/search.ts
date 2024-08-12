"use server";

export const search = async (query: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const mockResults = [
    { title: `${query} - Result 1`, author: "Author 1", price: 100 },
    { title: `${query} - Result 2`, author: "Author 2", price: 200 },
    {
      title: `${query} - Result 3`,
      author: "Author 3",
      price: 120,
      condition: "Good",
    },
  ];
  return mockResults;
};
