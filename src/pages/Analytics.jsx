import Sidebar from "../components/Sidebar";

export default function Analytics() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">
          Business Analytics
        </h1>

        <div className="grid grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">
              Best Selling Day
            </h3>
            <p className="text-3xl font-bold mt-3">
              Friday
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">
              Top Product
            </h3>
            <p className="text-3xl font-bold mt-3">
              Wireless Charger
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">
              Highest Margin
            </h3>
            <p className="text-3xl font-bold mt-3 text-green-600">
              34%
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">
              Total Revenue
            </h3>
            <p className="text-3xl font-bold mt-3 text-green-600">
              £12,450
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">
              Total Profit
            </h3>
            <p className="text-3xl font-bold mt-3 text-purple-600">
              £4,820
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">
              Top Employee
            </h3>
            <p className="text-3xl font-bold mt-3">
              EMP003
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow mt-8 p-6">
          <h2 className="text-xl font-bold mb-4">
            AI Business Insights
          </h2>

          <ul className="space-y-4">
            <li>
              📈 Friday generates the highest sales volume.
            </li>

            <li>
              📦 Wireless Chargers contribute 35% of total revenue.
            </li>

            <li>
              💰 Accessories category delivers the highest profit margins.
            </li>

            <li>
              👨‍💼 EMP003 entered the highest number of orders this month.
            </li>

            <li>
              🚀 Increase stock availability before weekends.
            </li>

            <li>
              ⚠️ Phone Mount category margin dropped by 12%.
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow mt-8 p-6">
          <h2 className="text-xl font-bold mb-4">
            Category Performance
          </h2>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">
                  Category
                </th>

                <th className="text-left py-3">
                  Revenue
                </th>

                <th className="text-left py-3">
                  Profit
                </th>

                <th className="text-left py-3">
                  Margin
                </th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b">
                <td className="py-3">
                  Chargers
                </td>
                <td>£5,200</td>
                <td>£2,100</td>
                <td>40%</td>
              </tr>

              <tr className="border-b">
                <td className="py-3">
                  Accessories
                </td>
                <td>£4,000</td>
                <td>£1,700</td>
                <td>42%</td>
              </tr>

              <tr>
                <td className="py-3">
                  Phone Mounts
                </td>
                <td>£3,250</td>
                <td>£1,020</td>
                <td>31%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}