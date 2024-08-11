import * as cheerio from "cheerio";

export const searchBookchor = async (query: string) => {
  const url =
    "https://www.bookchor.com/ajax-new.php?functionName=productlisting";
  const form_data = {
    payload:
      '{"json":"{\\"filters\\":[]}","cat_id":"","type_of_page":"search_wise_product","page":' +
      "1" +
      ',"sort_by":"null","query":null}',
  };
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const body = await response.text();
    const $ = cheerio.load(body);
  } catch (error: any) {
    console.error(error.message);
  }
};
