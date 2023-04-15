import Layout from './Layout'

type ResultsProps<T> = {
  columns: (Extract<keyof T, string>)[]
  data: Record<string, T>[]
}

export default function Results<T>({ columns, data }: ResultsProps<T>) {
  return (
    <Layout>
      <table>
        <thead>
          <tr>
            {columns.map((col) => <th>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr>
              {columns.map((col) => <td>{item[col]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>  
    </Layout>
  )
}
