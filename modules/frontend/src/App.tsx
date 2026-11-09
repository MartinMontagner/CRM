import { useEffect, useState } from "react"

function App() {

  const [status, setStatus] = useState<string>("FETCHING")

  useEffect(()=>{
    fetch(BACKEND_URL + "/status")
      .then((res) => {
        setStatus(res.status === 200 ? "OK" : "FAILED")
      })
      .catch((err) => {
        console.error(err);
        setStatus("FAILED");
      })
  },[])

  return (
    <main>
      <h1>MOYCA TEST</h1>
      <p>ENV: {TEST}</p>
      <p>BACK STATUS: {status}</p>
    </main>
  )
}

export default App
