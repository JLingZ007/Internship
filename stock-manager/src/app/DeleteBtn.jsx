"use client"

import React from 'react'
import Swal from 'sweetalert2'

function DeleteBtn({ id, title }) {

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'เมื่อลบแล้วจะไม่สามารถกู้คืนข้อมูลได้!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e3342f',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/posts?id=${id}`, {
          method: "DELETE"
        });

        if (res.ok) {
          // ✅ บันทึกประวัติการลบสินค้า
          await fetch("/api/history", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              productId: id,
              productTitle: title,
              timestamp: new Date().toISOString()
            })
          });

          Swal.fire({
            icon: 'success',
            title: 'ลบข้อมูลเรียบร้อยแล้ว',
            showConfirmButton: false,
            timer: 800
          });
          setTimeout(() => window.location.reload(), 1600);
        } else {
          throw new Error('ลบไม่สำเร็จ');
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลบข้อมูลได้',
        });
      }
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      className='bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 text-sm transition'
    >
      ลบ
    </button>
  )
}

export default DeleteBtn;
