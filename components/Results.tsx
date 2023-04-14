import Layout from './Layout'

type ResultsProps = {
  columns: string[]
  data: any[]
}

export default function Results({ columns, data }: ResultsProps) {
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
