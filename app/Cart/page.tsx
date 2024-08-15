"use client";
import React, { useState, useEffect } from "react";
import PaymentForm from "../components/PaymentPage";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CartItem {
  _id: number;
  title: string;
  price: number;
  images: any;
  description: string;
  quantity: number;
}

interface UserDetails {
  fullName: string;
  email: string;
}

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<UserDetails | null>(null);

  useEffect(() => {
    // Fetch cart data from local storage or an API
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);

    // Fetch user data from an API or local storage
    const fetchUserData = async () => {
      const response = await fetch('/api/UserAuth');
      const data = await response.json();
      setUser({
        fullName: `${data?.user?.firstName} ${data?.user?.lastName}`,
        email: data?.user?.emailAddresses?.[0]?.emailAddress || "",
      });
    };
    fetchUserData();
  }, []);

  if (cart.length === 0) {
    router.push(`/`);
    return null; // Return null to avoid rendering the rest of the component
  }

  const calculateTotal = (): number => {
    return cart.reduce(
      (total: number, item: CartItem) => total + item.price * item.quantity,
      0
    );
  };

  const handleDecrease = (item: CartItem): void => {
    let newCart = [...cart];
    if (item.quantity === 1) {
      newCart = newCart.filter((cartItem) => cartItem._id !== item._id);
    } else {
      newCart = newCart.map((cartItem) =>
        cartItem._id === item._id
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      );
    }
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart)); // Update local storage

    if (newCart.length === 0) {
      router.push(`/`);
    }
  };

  const handleDelete = (item: CartItem) => {
    let newCart = [...cart];
    newCart = newCart.filter((cartItem) => cartItem._id !== item._id);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart)); // Update local storage

    if (newCart.length === 0) {
      router.push(`/`);
    }
  };

  const handleIncrease = (item: CartItem): void => {
    const newCart = cart.map((cartItem: CartItem) =>
      cartItem._id === item._id
        ? { ...cartItem, quantity: cartItem.quantity + 1 }
        : cartItem
    );
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart)); // Update local storage
  };

  return (
    <div className="mx-auto mt-[150px]">
      <div className="flex gap-8 flex-wrap">
        <div className="bg-white flex-2 p-6 rounded-xl ">
          <h2 className="text-2xl font-semibold mb-4">Cart Items</h2>
          <ul className="flex flex-col gap-y-10">
            {cart?.map((item: CartItem) => (
              <li
                key={item._id}
                className="shadow-md rounded-lg p-5 flex gap-x-5 flex-col md:flex-row"
              >
                <Image
                  src={item.images[0]}
                  className="rounded-2xl shadow-xl"
                  alt={item.title}
                  width={150}
                  height={150}
                />
                <div className="flex flex-col gap-y-5 w-full">
                  <span className="w-full md:w-[500px]">
                    <p className="text-xl font-bold">{item.title}</p>
                    <p>{item.description}</p>
                  </span>
                  <span className="text-xl font-bold">₹ {item.price}</span>
                  <div className="flex items-center justify-between gap-x-2">
                    <p className="text-lg text-gray-500 font-semibold">
                      Number of Nights -
                    </p>
                    <div className="flex items-center justify-center gap-x-4">
                      <button
                        className="bg-gray-100 p-5 shadow-sm w-5 h-5 flex justify-center items-center border-2 rounded-lg border-b-4 active:border-b-2 border-gray-300"
                        onClick={() => handleDecrease(item)}
                      >
                        -
                      </button>{" "}
                      <p className="text-lg font-semibold">{item.quantity}</p>
                      <span>
                        <button
                          className="bg-gray-100 p-5 shadow-sm w-5 h-5 flex justify-center items-center border-2 rounded-lg border-b-4 active:border-b-2 border-gray-300"
                          onClick={() => handleIncrease(item)}
                        >
                          +
                        </button>
                      </span>
                    </div>
                    <div className="">
                      <button
                        onClick={() => handleDelete(item)}
                        className="bg-rose-500 text-white px-8 p-5 shadow-sm w-5 h-5 flex justify-center items-center border-2 rounded-lg border-b-4 active:border-b-2 border-gray-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 flex flex-col rounded-xl justify-center items-center bg-white">
          <table className="rounded-lg border border-collapse border-gray-100 p-5">
            <thead>
              <tr>
                <th colSpan={2} className="font-semibold mb-4 text-xl p-5">Order Summary</th>
              </tr>
            </thead>
            <tbody className="p-5">
              <tr className="border-b rounded-lg border-gray-400">
                <td className="p-2"><strong>Total Items:</strong></td>
                <td className="p-2 text-lg font-semibold">{cart?.length}</td>
              </tr>
              <tr className="border-b border-gray-400">
                <td className="p-2"><strong>Total Amount:</strong></td>
                <td className="p-2 text-lg font-semibold">₹ {calculateTotal().toFixed(2)}</td>
              </tr>
              <tr className="border-b border-gray-400">
                <td className="p-2"><strong>Full Name:</strong></td>
                <td className="p-2 text-lg font-semibold">{user?.fullName}</td>
              </tr>
              <tr>
                <td className="p-2"><strong>Email:</strong></td>
                <td className="p-2 text-lg font-semibold w-[50px] md:w-full ">{user?.email}</td>
              </tr>
            </tbody>
          </table>
          <div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5">
            <PaymentForm totalItem={cart?.length} price={calculateTotal().toFixed(2)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
