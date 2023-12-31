import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useDispatch, useSelector } from "react-redux";
import { setPaging, setProducts, setUrl } from "../features/productsSlice";

import axios from "axios";

import { Carousel, ProductList, Skeleton } from "../components/homepage";

const Homepage = () => {
    // redux
    const dispatch = useDispatch();
    const { paging, products, url, category, keyword } = useSelector(
        (state) => state.productsSlice
    );

    // state
    const [scrollY, setScrollY] = useState(0);

    const fetchData = async () => {
        try {
            // wait for 1 sec ( to see skeleton loading )
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const res = await axios.get(url);

            const { data, next_paging } = res.data;

            // set next page
            dispatch(setPaging(next_paging));
            dispatch(setProducts(data));
            dispatch(setUrl());

            return data;
        } catch (error) {
            console.log(error);
        }
    };

    //
    const { isLoading, isError, isSuccess, refetch, isFetching } = useQuery({
        queryFn: fetchData,
        queryKey: ["products"],
        staleTime: Infinity, // if you didn't set this, the data will call continuously when you alt+tab
    });

    // render product if category / keyword is changed ( by clicking header buttons )
    useEffect(() => {
        refetch();
    }, [category, keyword]);

    // store current scroll height
    const handleScroll = () => {
        setScrollY(window.scrollY);
    };

    // add scroll listener
    useEffect(() => {
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        // scroll at bottom
        const isAtBottom =
            scrollY >= document.body.scrollHeight - window.innerHeight - 100;

        // infinite scroll condition
        // 1. at bottom
        // 2. not at last page
        // 3. not loading now
        if (
            isAtBottom &&
            (paging || paging === -1) &&
            !(isLoading || isFetching)
        ) {
            refetch();
        }
    }, [scrollY]);

    return (
        <main className="grid grid-cols-12 gap-y-0 gap-x-1 sm:gap-x-5">
            {/* banner */}
            <Carousel />

            {isError && (
                <div className="col-span-12 text-center py-6 my-6 bg-red-500 text-white ">
                    No Product Found. Please try another keyword.
                </div>
            )}

            {isSuccess && <ProductList products={products} />}

            {/* skeleton loading */}
            {(isLoading || isFetching) && <Skeleton />}
        </main>
    );
};

export default Homepage;
