import Layout from './Layout'

type ResultsProps<T> = {
  columns: (Extract<keyof T, string>)[]
  data: Record<string, T>[]
}

export default function Results<T>({ columns, data }: ResultsProps<T>) {
  return (
    <Layout>
      <table class='text-white w-full text-left'>
        <thead class='bg-gray-900'>
          <tr>
            {columns.map((col) => <th class='p-4'>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr class='border-b bg-gray-800 odd:bg-gray-700 border-gray-700 p-4'>
              {columns.map((col) => <td class='p-4'>{item[col]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>  
    </Layout>
  )
}
