export default function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow">
      <h3 className="text-gray-500 text-sm">
        {title}
      </h3>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>
    </div>
  );
}