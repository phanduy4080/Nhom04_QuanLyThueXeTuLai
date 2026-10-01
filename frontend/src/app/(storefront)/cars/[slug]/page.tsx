interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CarDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Chi Tiết Xe: {slug}</h1>
      <p className="text-slate-600">Thông số kỹ thuật, bảng giá thuê và hình ảnh chi tiết.</p>
    </div>
  );
}
