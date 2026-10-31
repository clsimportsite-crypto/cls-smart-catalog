import { redirect } from "next/navigation";

// A raiz leva ao painel; o middleware manda para /entrar quem não está logado.
export default function Inicio() {
  redirect("/painel");
}
