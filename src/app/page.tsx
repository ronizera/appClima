"use client"

import { useState } from "react";

export default function Home() {
  const [valor, setValor] = useState<string>("")
  const [moedaOrigem, setMoedaOrigem] = useState<string>("BRL")
  const [moedaDestino, setMoedaDestino] = useState<string>("USD")
  const [resultado, setResultado] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [erro, setErro] = useState<string>("")

  const converter = async () => {
    const valorNumerico = parseFloat(valor)
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      setErro("Digite um valor válido")
      return
    }

    setErro("")
    setResultado(null)
    setLoading(true)

    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${moedaOrigem}`)
      if (!res.ok) throw new Error("Erro ao obter taxa de câmbio")

      const data = await res.json()

      const taxa = data?.rates?.[moedaDestino]

      if (!taxa) throw new Error("Conversão indisponível no momento")

      const convertido = valorNumerico * taxa
      setResultado(convertido)
    } catch (err: unknown) {
      if (err instanceof Error) setErro(err.message)
      else setErro("Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Conversor de Moedas</h1>

      <input
        type="number"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="Digite um valor"
      />

      <select value={moedaOrigem} onChange={(e) => setMoedaOrigem(e.target.value)}>
        <option value="BRL">BRL</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
      </select>

      <select value={moedaDestino} onChange={(e) => setMoedaDestino(e.target.value)}>
        <option value="BRL">BRL</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
      </select>

      <button onClick={converter}>Converter</button>

      {loading && <p>Carregando...</p>}
      {erro && <p style={{ color: "red" }}>{erro}</p>}

      {resultado !== null && (
        <p>{valor} {moedaOrigem} = {resultado.toFixed(2)} {moedaDestino}</p>
      )}
    </div>
  );
}
