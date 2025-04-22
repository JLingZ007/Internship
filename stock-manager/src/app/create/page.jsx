"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [img, setImg] = useState(""); // base64
  const [preview, setPreview] = useState(null); // สำหรับ preview
  const [content, setContent] = useState("");

  const router = useRouter();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImg(reader.result); // base64 string
      setPreview(reader.result); // สำหรับ preview
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !img || !content) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน!");
      return;
    }

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, img, content })
      });

      if (res.ok) {
        router.push("/");
      } else {
        throw new Error("เกิดข้อผิดพลาดในการสร้าง");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='container mx-auto py-10'>
      <h3 className='text-3xl font-bold'>Create Post</h3>
      <hr className='my-3' />
      <Link href="/" className='bg-gray-500 inline-block text-white border py-2 px-3 rounded my-2'>Go back</Link>

      <form onSubmit={handleSubmit}>
        <input
          onChange={(e) => setTitle(e.target.value)}
          type="text"
          className='w-[300px] block bg-gray-200 border py-2 px-3 rounded text-lg my-2'
          placeholder='Post title'
        />

        <input
          onChange={handleImageChange}
          type="file"
          accept='image/*'
          className='w-[300px] block bg-gray-200 border py-2 px-3 rounded text-lg my-2'
        />

        {preview && (
          <img
            src={preview}
            alt="preview"
            className='w-[300px] h-auto rounded my-2 border'
          />
        )}

        <textarea
          onChange={(e) => setContent(e.target.value)}
          className='w-[300px] block bg-gray-200 border py-2 px-3 rounded text-lg my-2'
          placeholder='Enter your content'
        />

        <button
          type='submit'
          className='bg-green-500 text-white border py-2 px-3 rounded text-lg my-2'
        >
          Create Post
        </button>
      </form>
    </div>
  );
}

export default CreatePostPage;
