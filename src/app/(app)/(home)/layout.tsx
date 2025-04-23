import { getPayload } from "payload";
import configPromise from "@payload-config";
import { Category } from "@/payload-types";

import { Footer } from "./footer";
import { Navbar } from "./navbar";
import { SearchFilters } from "./search-filters";

interface Props {
  children: React.ReactNode;
}
const Layout = async ({ children }: Props) => {
  const payload = await getPayload({
    config: configPromise,
  }); // initializes Payload CMS client

  const data = await payload.find({
    collection: "categories",
    depth: 1, // Control relationship depth for populating subcategorie, subcategories.[0] will be of type "Category".
    pagination: false,
    where: {
      parent: {
        exists: false,
      },
    },
  }); // query db

  const formatedData = data.docs.map((doc) => ({
    ...doc,
    subcategories: (doc.subcategories?.docs || []).map((subDoc) => ({
      // because of "depth: 1" we are confident "doc"  wil be a type of "Category".
      ...(subDoc as Category),
      subcategories: undefined,
    })),
  }));

  console.log(formatedData);

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F4F0]">
      <Navbar />
      <SearchFilters data={formatedData} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;

/*


data :
[
  {
    "name": "Categorie1",
    "color": "#FFB347",
    "slug": "categorie1",
    "subcategories": {
      "docs": [
        {
          "name": "Categorie1sub1",
          "slug": "categorie1sub1",
          "parent": "68034114d2ad137981185940",
          "subcategories": {
              "docs": [],
              "hasNextPage": false
          },
          "id": "6803afdf3f7d73bb275a4773"
        }
      ],
      "hasNextPage": false
    },
    "id": "68034114d2ad137981185940"
  }
]


formatedData :
 [
  {
    "name": "Categorie1",
    "color": "#FFB347",
    "slug": "categorie1",
    "subcategories": [
      {
        "name": "Categorie1sub1",
        "slug": "categorie1sub1",
        "parent": "68034114d2ad137981185940",
        "id": "6803afdf3f7d73bb275a4773"
      }
    ],
    "id": "68034114d2ad137981185940"
  }
]

 */
