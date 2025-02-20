import axios from "axios";
import React, { useEffect, useState } from "react";
import ProductCard from "../views/ProductCard";
import Loader from "../ui/Loader";
import { useFilter } from "../../context/FilterContext";
import { useSearchParams } from "react-router";

const ProductsDisplay = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { state, dispatch } = useFilter();
    const [searchParams, setSearchParams] = useSearchParams();

    // Učitaj filtere iz URL-a pri prvom renderovanju
    useEffect(() => {
        const sortFromUrl = searchParams.get("sort") || "";
        const searchFromURL = searchParams.get("name") || "";
        const categoryFromUrl = searchParams.get("category") || "";

        dispatch({ type: "SET_SORT", payload: sortFromUrl});
        dispatch({ type: "SET_NAME", payload: searchFromURL });
        dispatch({ type: "SET_CATEGORY", payload: categoryFromUrl});
    }, []);

    // Fetch proizvoda sa filtracijom
    useEffect(() => {
        setLoading(true);
        axios.get('https://furniture-api.fly.dev/v1/products/', {
            params: {
                limit: 100,
                sort: state.sort || undefined,
                name: state.name || undefined,
                category: state.category || undefined,
            }
        })
        .then((res) => {
            setProducts(res.data.data);
            setLoading(false);
        })
        .catch((err) => {
            console.error("Error fetching products:", err);
            setLoading(false);
        });
    }, [state.sort, state.name, state.category]);

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSort = e.target.value;
        dispatch({ type: "SET_SORT", payload: newSort });

        setSearchParams((prev: any) => {
            const params = new URLSearchParams(prev);
            params.set("sort", newSort);
            return params;
        });
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategory = e.target.value;
        dispatch({ type: "SET_CATEGORY", payload: newCategory})

        setSearchParams((perv: any) => {
            const params = new URLSearchParams(perv);
            params.set('category', newCategory);
            return params;
        })
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearch = e.target.value;
        dispatch({ type: "SET_NAME", payload: newSearch });

        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            params.set("search", newSearch);
            return params;
        });
    };


    return (
        <main className="mt-[90px] px-5">
            <nav className="flex justify-start gap-3 mb-3">
                <select className="p-2" onChange={handleSortChange} value={state.sort}>
                    <option value="">Sort</option>
                    <option value="price_asc">Price (Min to Max)</option>
                    <option value="price_desc">Price (Max to Min)</option>
                    <option value="name_asc">A-Z</option>
                    <option value="name_desc">Z-A</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                </select>
                <select className="p-2" onChange={handleCategoryChange} value={state.sort}>
                    <option value="">Category</option>
                    <option value="sofa">Sofa</option>
                    <option value="chair">Chair</option>
                    <option value="stool">Stool</option>
                    <option value="table">Table</option>
                    <option value="desk">Desks</option>
                    <option value="kitchen">Kitchen</option>
                </select>
                <input
                    type="text"
                    placeholder="Search..."
                    onChange={handleSearchChange}
                    className="border p-2 "
                />
            </nav>

            {state.name.length > 0 && (
                <h1 className="font-bold text-xl">Results for "{state.name}"</h1>
            )}

            <section className={`w-full h-full ${!loading ? 'grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 place-items-center gap-5' : 'flex justify-center items-center'}`}>
                {!loading ? (
                    products.length > 0 ? (
                        products.map((p) => (
                            <ProductCard key={p.id} img={p.image_path} title={p.name} price={p.price} />
                        ))
                    ) : (
                        <p className="text-center mt-5 text-lg">No products found.</p>
                    )
                )
                :
                (
                    <Loader />
                )}
            </section>
        </main>
    );
};

export default ProductsDisplay;
