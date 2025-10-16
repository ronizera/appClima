"use client"
import { Search } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

type Clima = {
  name: string
  main: {
    temp: number
    humidity: number
  }
  weather: {
    description: string
    icon: string
  }[]
  sys: {
    country: string
    sunrise: number
    sunset: number
  }
  timezone: number
}

export default function Home() {
  const [cidade, setCidade] = useState<string>("")
  const [clima, setClima] = useState<Clima | null>(null)
  const [erro, setErro] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const buscarClima = async (nomeCidade?: string) => {
    const cidadeAtual = nomeCidade || cidade
    if (!cidadeAtual) return

    setErro("")
    setClima(null)
    setLoading(true)

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cidadeAtual}&units=metric&appid=${process.env.NEXT_PUBLIC_API_KEY}`
      )
      if (!res.ok) throw new Error("Digite outra cidade")
      const data = await res.json()
      setClima(data)

      localStorage.setItem("ultimaCidade", cidadeAtual)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErro(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const cidadeSalva = localStorage.getItem("ultimaCidade")
    if (cidadeSalva) {
      setCidade(cidadeSalva)
      buscarClima(cidadeSalva)
    }
  }, [])

  const getDataAgora = () => {
    const agora = new Date()
    return agora.toLocaleString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Detecta dia/noite com base no nascer e pôr do sol
  const getBgPorClima = () => {
    if (!clima) return "from-sky-400 to-blue-700"

    const descricao = clima.weather[0].description.toLowerCase()
    const agoraUTC = Math.floor(Date.now() / 1000)
    const horarioLocal = agoraUTC + clima.timezone
    const isNoite =
      horarioLocal < clima.sys.sunrise + clima.timezone ||
      horarioLocal > clima.sys.sunset + clima.timezone

    if (isNoite) return "from-[#0a1e3d] to-[#1a2747]" // noite
    if (descricao.includes("chuva")) return "from-sky-500 to-blue-700"
    if (descricao.includes("nublado")) return "from-gray-400 to-gray-600"
    if (descricao.includes("neve")) return "from-blue-200 to-white"
    return "from-amber-300 to-orange-600" // dia ensolarado
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center text-white transition-all duration-700 p-5 bg-gradient-to-b ${getBgPorClima()}`}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 drop-shadow-lg"
      >
        <h1 className="text-5xl font-bold mb-1 tracking-wide">☀️ Clima</h1>
        <p className="opacity-90 text-lg">Descubra o tempo na sua cidade</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          placeholder="Digite uma cidade..."
          className="px-4 py-2 rounded-2xl text-black outline-none w-64 bg-white/90 shadow-inner"
        />
        <button
          onClick={() => buscarClima()}
          className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full transition-transform hover:scale-105 active:scale-95"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {loading && <p className="text-lg animate-pulse">Carregando...</p>}
      {erro && <p className="text-red-300 font-semibold">{erro}</p>}

      {clima && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/20 backdrop-blur-lg p-6 rounded-2xl shadow-xl text-center space-y-2"
        >
          <h2 className="text-3xl font-bold mb-1">
            {clima.name}, {clima.sys.country}
          </h2>
          <p className="capitalize text-lg opacity-90">
            {clima.weather[0].description}
          </p>
          <img
            src={`https://openweathermap.org/img/wn/${clima.weather[0].icon}@2x.png`}
            alt="ícone do clima"
            className="mx-auto drop-shadow-md"
          />
          <p className="text-6xl font-bold">{Math.round(clima.main.temp)}°C</p>
          <p className="text-sm opacity-80">{getDataAgora()}</p>
          <p className="text-sm opacity-80">Umidade: {clima.main.humidity}%</p>
        </motion.div>
      )}
    </div>
  )
}
