export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      anuncios_gasto: {
        Row: {
          ad_id: string
          ad_nome: string | null
          atualizado_em: string | null
          campanha: string | null
          campanha_id: string | null
          cliques: number | null
          conjunto: string | null
          conversas_meta: number | null
          data: string
          empresa_id: string
          gasto: number | null
          impressoes: number | null
        }
        Insert: {
          ad_id: string
          ad_nome?: string | null
          atualizado_em?: string | null
          campanha?: string | null
          campanha_id?: string | null
          cliques?: number | null
          conjunto?: string | null
          conversas_meta?: number | null
          data: string
          empresa_id: string
          gasto?: number | null
          impressoes?: number | null
        }
        Update: {
          ad_id?: string
          ad_nome?: string | null
          atualizado_em?: string | null
          campanha?: string | null
          campanha_id?: string | null
          cliques?: number | null
          conjunto?: string | null
          conversas_meta?: number | null
          data?: string
          empresa_id?: string
          gasto?: number | null
          impressoes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "anuncios_gasto_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      cadastros: {
        Row: {
          aceite: boolean
          aprovado_em: string | null
          aprovado_por: string | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          cliente_id: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          empresa_id: string
          endereco: string | null
          fotos: string[] | null
          id: string
          interesse: string | null
          lead_id: string | null
          lead_ref: string | null
          motivo: string | null
          nome: string
          numero: string | null
          revenda: Json | null
          status: string
          swap: Json | null
          telefone: string
          tipo: string
          uf: string | null
          vendedor_nome: string | null
        }
        Insert: {
          aceite?: boolean
          aprovado_em?: string | null
          aprovado_por?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cliente_id?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          empresa_id: string
          endereco?: string | null
          fotos?: string[] | null
          id?: string
          interesse?: string | null
          lead_id?: string | null
          lead_ref?: string | null
          motivo?: string | null
          nome: string
          numero?: string | null
          revenda?: Json | null
          status?: string
          swap?: Json | null
          telefone: string
          tipo?: string
          uf?: string | null
          vendedor_nome?: string | null
        }
        Update: {
          aceite?: boolean
          aprovado_em?: string | null
          aprovado_por?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cliente_id?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          empresa_id?: string
          endereco?: string | null
          fotos?: string[] | null
          id?: string
          interesse?: string | null
          lead_id?: string | null
          lead_ref?: string | null
          motivo?: string | null
          nome?: string
          numero?: string | null
          revenda?: Json | null
          status?: string
          swap?: Json | null
          telefone?: string
          tipo?: string
          uf?: string | null
          vendedor_nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cadastros_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      cat_categorias: {
        Row: {
          ativa: boolean
          created_at: string
          empresa_id: string
          id: string
          nome: string
          ordem: number
          pai_id: string | null
          slug: string
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          empresa_id: string
          id?: string
          nome: string
          ordem?: number
          pai_id?: string | null
          slug: string
        }
        Update: {
          ativa?: boolean
          created_at?: string
          empresa_id?: string
          id?: string
          nome?: string
          ordem?: number
          pai_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "cat_categorias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_categorias_pai_id_empresa_id_fkey"
            columns: ["pai_id", "empresa_id"]
            isOneToOne: false
            referencedRelation: "cat_categorias"
            referencedColumns: ["id", "empresa_id"]
          },
        ]
      }
      cat_custos: {
        Row: {
          criado_por: string | null
          custo: number
          empresa_id: string
          fornecedor_id: string | null
          id: string
          importacao_id: string | null
          produto_id: string
          vigente_desde: string
        }
        Insert: {
          criado_por?: string | null
          custo: number
          empresa_id: string
          fornecedor_id?: string | null
          id?: string
          importacao_id?: string | null
          produto_id: string
          vigente_desde?: string
        }
        Update: {
          criado_por?: string | null
          custo?: number
          empresa_id?: string
          fornecedor_id?: string | null
          id?: string
          importacao_id?: string | null
          produto_id?: string
          vigente_desde?: string
        }
        Relationships: [
          {
            foreignKeyName: "cat_custos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_custos_importacao_id_empresa_id_fkey"
            columns: ["importacao_id", "empresa_id"]
            isOneToOne: false
            referencedRelation: "cat_importacoes"
            referencedColumns: ["id", "empresa_id"]
          },
          {
            foreignKeyName: "cat_custos_produto_id_empresa_id_fkey"
            columns: ["produto_id", "empresa_id"]
            isOneToOne: false
            referencedRelation: "cat_produtos"
            referencedColumns: ["id", "empresa_id"]
          },
        ]
      }
      cat_eventos: {
        Row: {
          canal: string
          created_at: string
          empresa_id: string
          id: number
          origem: string | null
          produto_id: string | null
          sessao: string | null
          tipo: string
        }
        Insert: {
          canal?: string
          created_at?: string
          empresa_id: string
          id?: never
          origem?: string | null
          produto_id?: string | null
          sessao?: string | null
          tipo: string
        }
        Update: {
          canal?: string
          created_at?: string
          empresa_id?: string
          id?: never
          origem?: string | null
          produto_id?: string | null
          sessao?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "cat_eventos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_eventos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "cat_produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      cat_historico: {
        Row: {
          acao: string
          antes: Json | null
          created_at: string
          depois: Json | null
          empresa_id: string
          id: number
          registro_id: string
          tabela: string
          usuario_id: string | null
        }
        Insert: {
          acao: string
          antes?: Json | null
          created_at?: string
          depois?: Json | null
          empresa_id: string
          id?: never
          registro_id: string
          tabela: string
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          antes?: Json | null
          created_at?: string
          depois?: Json | null
          empresa_id?: string
          id?: never
          registro_id?: string
          tabela?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      cat_imagens: {
        Row: {
          cor: string | null
          created_at: string
          empresa_id: string | null
          fonte: string | null
          id: string
          modelo_id: string
          ordem: number
          tipo: string
          url: string
          verificada: boolean
        }
        Insert: {
          cor?: string | null
          created_at?: string
          empresa_id?: string | null
          fonte?: string | null
          id?: string
          modelo_id: string
          ordem?: number
          tipo: string
          url: string
          verificada?: boolean
        }
        Update: {
          cor?: string | null
          created_at?: string
          empresa_id?: string | null
          fonte?: string | null
          id?: string
          modelo_id?: string
          ordem?: number
          tipo?: string
          url?: string
          verificada?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "cat_imagens_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_imagens_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "cat_modelos"
            referencedColumns: ["id"]
          },
        ]
      }
      cat_importacao_itens: {
        Row: {
          acao: string | null
          campos_duvidosos: string[]
          confianca: number | null
          created_at: string
          dados: Json
          empresa_id: string
          id: string
          importacao_id: string
          linha_num: number
          linha_original: string
          mudancas: Json | null
          produto_existente_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          acao?: string | null
          campos_duvidosos?: string[]
          confianca?: number | null
          created_at?: string
          dados?: Json
          empresa_id: string
          id?: string
          importacao_id: string
          linha_num: number
          linha_original: string
          mudancas?: Json | null
          produto_existente_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          acao?: string | null
          campos_duvidosos?: string[]
          confianca?: number | null
          created_at?: string
          dados?: Json
          empresa_id?: string
          id?: string
          importacao_id?: string
          linha_num?: number
          linha_original?: string
          mudancas?: Json | null
          produto_existente_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cat_importacao_itens_importacao_id_empresa_id_fkey"
            columns: ["importacao_id", "empresa_id"]
            isOneToOne: false
            referencedRelation: "cat_importacoes"
            referencedColumns: ["id", "empresa_id"]
          },
          {
            foreignKeyName: "cat_importacao_itens_produto_existente_id_empresa_id_fkey"
            columns: ["produto_existente_id", "empresa_id"]
            isOneToOne: false
            referencedRelation: "cat_produtos"
            referencedColumns: ["id", "empresa_id"]
          },
        ]
      }
      cat_importacoes: {
        Row: {
          aplicada_em: string | null
          arquivo_nome: string | null
          created_at: string
          criado_por: string | null
          empresa_id: string
          erro: string | null
          fornecedor_id: string | null
          id: string
          itens_duplicados: number
          itens_prontos: number
          itens_revisar: number
          origem: string
          status: string
          texto_original: string
          total_itens: number
        }
        Insert: {
          aplicada_em?: string | null
          arquivo_nome?: string | null
          created_at?: string
          criado_por?: string | null
          empresa_id: string
          erro?: string | null
          fornecedor_id?: string | null
          id?: string
          itens_duplicados?: number
          itens_prontos?: number
          itens_revisar?: number
          origem: string
          status?: string
          texto_original: string
          total_itens?: number
        }
        Update: {
          aplicada_em?: string | null
          arquivo_nome?: string | null
          created_at?: string
          criado_por?: string | null
          empresa_id?: string
          erro?: string | null
          fornecedor_id?: string | null
          id?: string
          itens_duplicados?: number
          itens_prontos?: number
          itens_revisar?: number
          origem?: string
          status?: string
          texto_original?: string
          total_itens?: number
        }
        Relationships: [
          {
            foreignKeyName: "cat_importacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_importacoes_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      cat_lojas: {
        Row: {
          cor_primaria: string | null
          cor_secundaria: string | null
          created_at: string
          descricao: string | null
          empresa_id: string
          endereco: string | null
          fonte_cliente: string
          fonte_revenda: string
          id: string
          instagram: string | null
          logo_url: string | null
          nome: string
          publicada: boolean
          slug: string
          token_revenda: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string
          descricao?: string | null
          empresa_id: string
          endereco?: string | null
          fonte_cliente?: string
          fonte_revenda?: string
          id?: string
          instagram?: string | null
          logo_url?: string | null
          nome: string
          publicada?: boolean
          slug: string
          token_revenda?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string
          descricao?: string | null
          empresa_id?: string
          endereco?: string | null
          fonte_cliente?: string
          fonte_revenda?: string
          id?: string
          instagram?: string | null
          logo_url?: string | null
          nome?: string
          publicada?: boolean
          slug?: string
          token_revenda?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cat_lojas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: true
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      cat_membros: {
        Row: {
          ativo: boolean
          created_at: string
          empresa_id: string
          id: string
          papel: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          empresa_id: string
          id?: string
          papel: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          empresa_id?: string
          id?: string
          papel?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cat_membros_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      cat_modelos: {
        Row: {
          ano: number | null
          apelidos: string[]
          ativo: boolean
          cores: string[]
          created_at: string
          empresa_id: string | null
          id: string
          linha: string | null
          marca: string
          memorias: string[]
          nome: string
          slug: string
          updated_at: string
        }
        Insert: {
          ano?: number | null
          apelidos?: string[]
          ativo?: boolean
          cores?: string[]
          created_at?: string
          empresa_id?: string | null
          id?: string
          linha?: string | null
          marca: string
          memorias?: string[]
          nome: string
          slug: string
          updated_at?: string
        }
        Update: {
          ano?: number | null
          apelidos?: string[]
          ativo?: boolean
          cores?: string[]
          created_at?: string
          empresa_id?: string | null
          id?: string
          linha?: string | null
          marca?: string
          memorias?: string[]
          nome?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cat_modelos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      cat_precos: {
        Row: {
          canal: string
          empresa_id: string
          id: string
          origem: string
          preco_promocional: number | null
          preco_vista: number
          produto_id: string
          promo_ate: string | null
          updated_at: string
        }
        Insert: {
          canal: string
          empresa_id: string
          id?: string
          origem?: string
          preco_promocional?: number | null
          preco_vista: number
          produto_id: string
          promo_ate?: string | null
          updated_at?: string
        }
        Update: {
          canal?: string
          empresa_id?: string
          id?: string
          origem?: string
          preco_promocional?: number | null
          preco_vista?: number
          produto_id?: string
          promo_ate?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cat_precos_produto_id_empresa_id_fkey"
            columns: ["produto_id", "empresa_id"]
            isOneToOne: false
            referencedRelation: "cat_produtos"
            referencedColumns: ["id", "empresa_id"]
          },
        ]
      }
      cat_produtos: {
        Row: {
          armazenamento: string | null
          categoria_id: string | null
          chave: string | null
          condicao: string
          cor: string | null
          created_at: string
          descricao: string | null
          disponivel_fornecedor: boolean
          empresa_id: string
          fornecedor_atualizado_em: string | null
          fornecedor_id: string | null
          id: string
          modelo_id: string | null
          nome: string
          observacoes: string | null
          produto_cls_id: string | null
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          armazenamento?: string | null
          categoria_id?: string | null
          chave?: string | null
          condicao: string
          cor?: string | null
          created_at?: string
          descricao?: string | null
          disponivel_fornecedor?: boolean
          empresa_id: string
          fornecedor_atualizado_em?: string | null
          fornecedor_id?: string | null
          id?: string
          modelo_id?: string | null
          nome: string
          observacoes?: string | null
          produto_cls_id?: string | null
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          armazenamento?: string | null
          categoria_id?: string | null
          chave?: string | null
          condicao?: string
          cor?: string | null
          created_at?: string
          descricao?: string | null
          disponivel_fornecedor?: boolean
          empresa_id?: string
          fornecedor_atualizado_em?: string | null
          fornecedor_id?: string | null
          id?: string
          modelo_id?: string | null
          nome?: string
          observacoes?: string | null
          produto_cls_id?: string | null
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cat_produtos_categoria_id_empresa_id_fkey"
            columns: ["categoria_id", "empresa_id"]
            isOneToOne: false
            referencedRelation: "cat_categorias"
            referencedColumns: ["id", "empresa_id"]
          },
          {
            foreignKeyName: "cat_produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_produtos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_produtos_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "cat_modelos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_produtos_produto_cls_id_fkey"
            columns: ["produto_cls_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_produtos_produto_cls_id_fkey"
            columns: ["produto_cls_id"]
            isOneToOne: false
            referencedRelation: "v_estoque_consolidado"
            referencedColumns: ["produto_id"]
          },
        ]
      }
      cat_regras_preco: {
        Row: {
          alcance: string
          arredondamento: string
          ativa: boolean
          canal: string
          categoria_id: string | null
          condicao: string | null
          created_at: string
          empresa_id: string
          id: string
          margem_fixa: number
          margem_pct: number
          produto_id: string | null
          updated_at: string
        }
        Insert: {
          alcance: string
          arredondamento?: string
          ativa?: boolean
          canal: string
          categoria_id?: string | null
          condicao?: string | null
          created_at?: string
          empresa_id: string
          id?: string
          margem_fixa?: number
          margem_pct?: number
          produto_id?: string | null
          updated_at?: string
        }
        Update: {
          alcance?: string
          arredondamento?: string
          ativa?: boolean
          canal?: string
          categoria_id?: string | null
          condicao?: string | null
          created_at?: string
          empresa_id?: string
          id?: string
          margem_fixa?: number
          margem_pct?: number
          produto_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cat_regras_preco_categoria_id_empresa_id_fkey"
            columns: ["categoria_id", "empresa_id"]
            isOneToOne: false
            referencedRelation: "cat_categorias"
            referencedColumns: ["id", "empresa_id"]
          },
          {
            foreignKeyName: "cat_regras_preco_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_regras_preco_produto_id_empresa_id_fkey"
            columns: ["produto_id", "empresa_id"]
            isOneToOne: false
            referencedRelation: "cat_produtos"
            referencedColumns: ["id", "empresa_id"]
          },
        ]
      }
      cat_taxas_cartao: {
        Row: {
          empresa_id: string
          id: string
          parcelas: number
          taxa_pct: number
        }
        Insert: {
          empresa_id: string
          id?: string
          parcelas: number
          taxa_pct: number
        }
        Update: {
          empresa_id?: string
          id?: string
          parcelas?: number
          taxa_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "cat_taxas_cartao_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          created_at: string | null
          empresa_id: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          empresa_id: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          empresa_id?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_financeiras: {
        Row: {
          created_at: string | null
          empresa_id: string | null
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          nome: string
          tipo: string
        }
        Update: {
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_financeiras_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          ativo: boolean | null
          bairro: string | null
          canal_origem: string | null
          cep: string | null
          cidade: string | null
          cpf_cnpj: string | null
          created_at: string | null
          email: string | null
          empresa_id: string
          endereco: Json | null
          id: string
          nome: string
          numero: string | null
          observacoes: string | null
          proximo_contato: string | null
          tags: string | null
          telefone: string | null
          uf: string | null
          updated_at: string | null
          vendedor_id: string | null
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean | null
          bairro?: string | null
          canal_origem?: string | null
          cep?: string | null
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          empresa_id: string
          endereco?: Json | null
          id?: string
          nome: string
          numero?: string | null
          observacoes?: string | null
          proximo_contato?: string | null
          tags?: string | null
          telefone?: string | null
          uf?: string | null
          updated_at?: string | null
          vendedor_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean | null
          bairro?: string | null
          canal_origem?: string | null
          cep?: string | null
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          empresa_id?: string
          endereco?: Json | null
          id?: string
          nome?: string
          numero?: string | null
          observacoes?: string | null
          proximo_contato?: string | null
          tags?: string | null
          telefone?: string | null
          uf?: string | null
          updated_at?: string | null
          vendedor_id?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      conciliacoes: {
        Row: {
          created_at: string | null
          empresa_id: string
          id: string
          observacao: string | null
          origem: string | null
          referencia: string | null
          resolvido_em: string | null
          resolvido_por: string | null
          status: string
          tipo: string
          updated_at: string | null
          valor_esperado: string | null
          valor_sistema: string | null
        }
        Insert: {
          created_at?: string | null
          empresa_id: string
          id?: string
          observacao?: string | null
          origem?: string | null
          referencia?: string | null
          resolvido_em?: string | null
          resolvido_por?: string | null
          status?: string
          tipo: string
          updated_at?: string | null
          valor_esperado?: string | null
          valor_sistema?: string | null
        }
        Update: {
          created_at?: string | null
          empresa_id?: string
          id?: string
          observacao?: string | null
          origem?: string | null
          referencia?: string | null
          resolvido_em?: string | null
          resolvido_por?: string | null
          status?: string
          tipo?: string
          updated_at?: string | null
          valor_esperado?: string | null
          valor_sistema?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conciliacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conciliacoes_resolvido_por_fkey"
            columns: ["resolvido_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_pagar: {
        Row: {
          boleto_url: string | null
          categoria: string | null
          created_at: string | null
          data_pagamento: string | null
          descricao: string | null
          empresa_id: string
          forma_pagamento: string | null
          fornecedor_id: string | null
          id: string
          nota_entrada_id: string | null
          recorrente: boolean | null
          status: string
          tipo_despesa: string | null
          updated_at: string | null
          valor: number
          valor_pago: number | null
          vencimento: string
        }
        Insert: {
          boleto_url?: string | null
          categoria?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          descricao?: string | null
          empresa_id: string
          forma_pagamento?: string | null
          fornecedor_id?: string | null
          id?: string
          nota_entrada_id?: string | null
          recorrente?: boolean | null
          status?: string
          tipo_despesa?: string | null
          updated_at?: string | null
          valor: number
          valor_pago?: number | null
          vencimento: string
        }
        Update: {
          boleto_url?: string | null
          categoria?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          descricao?: string | null
          empresa_id?: string
          forma_pagamento?: string | null
          fornecedor_id?: string | null
          id?: string
          nota_entrada_id?: string | null
          recorrente?: boolean | null
          status?: string
          tipo_despesa?: string | null
          updated_at?: string | null
          valor?: number
          valor_pago?: number | null
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "contas_pagar_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_nota_entrada_id_fkey"
            columns: ["nota_entrada_id"]
            isOneToOne: false
            referencedRelation: "notas_entrada"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_receber: {
        Row: {
          boleto_url: string | null
          cliente_id: string | null
          created_at: string | null
          data_pagamento: string | null
          descricao: string | null
          documento: string | null
          empresa_id: string
          forma_pagamento: string | null
          id: string
          recorrente: boolean | null
          status: string
          updated_at: string | null
          valor: number
          valor_pago: number | null
          vencimento: string
          venda_id: string | null
        }
        Insert: {
          boleto_url?: string | null
          cliente_id?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          descricao?: string | null
          documento?: string | null
          empresa_id: string
          forma_pagamento?: string | null
          id?: string
          recorrente?: boolean | null
          status?: string
          updated_at?: string | null
          valor: number
          valor_pago?: number | null
          vencimento: string
          venda_id?: string | null
        }
        Update: {
          boleto_url?: string | null
          cliente_id?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          descricao?: string | null
          documento?: string | null
          empresa_id?: string
          forma_pagamento?: string | null
          id?: string
          recorrente?: boolean | null
          status?: string
          updated_at?: string | null
          valor?: number
          valor_pago?: number | null
          vencimento?: string
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_receber_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      conversas: {
        Row: {
          aguardando: boolean | null
          arquivada: boolean | null
          auto_fora_em: string | null
          canal: string
          cliente_id: string | null
          contato_id: string
          created_at: string | null
          empresa_id: string
          id: string
          lead_id: string | null
          nao_lidas: number | null
          nome: string | null
          responsavel: string | null
          telefone: string | null
          ultima_em: string | null
          ultima_msg: string | null
        }
        Insert: {
          aguardando?: boolean | null
          arquivada?: boolean | null
          auto_fora_em?: string | null
          canal: string
          cliente_id?: string | null
          contato_id: string
          created_at?: string | null
          empresa_id: string
          id?: string
          lead_id?: string | null
          nao_lidas?: number | null
          nome?: string | null
          responsavel?: string | null
          telefone?: string | null
          ultima_em?: string | null
          ultima_msg?: string | null
        }
        Update: {
          aguardando?: boolean | null
          arquivada?: boolean | null
          auto_fora_em?: string | null
          canal?: string
          cliente_id?: string | null
          contato_id?: string
          created_at?: string | null
          empresa_id?: string
          id?: string
          lead_id?: string | null
          nao_lidas?: number | null
          nome?: string | null
          responsavel?: string | null
          telefone?: string | null
          ultima_em?: string | null
          ultima_msg?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          auto_qualificacao: boolean | null
          capi_dataset_id: string | null
          celular_atendente: string | null
          cnpj: string | null
          created_at: string | null
          email: string | null
          endereco: Json | null
          id: string
          ie: string | null
          msg_qualificacao: string | null
          nome_fantasia: string | null
          razao_social: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          auto_qualificacao?: boolean | null
          capi_dataset_id?: string | null
          celular_atendente?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: Json | null
          id?: string
          ie?: string | null
          msg_qualificacao?: string | null
          nome_fantasia?: string | null
          razao_social: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_qualificacao?: boolean | null
          capi_dataset_id?: string | null
          celular_atendente?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: Json | null
          id?: string
          ie?: string | null
          msg_qualificacao?: string | null
          nome_fantasia?: string | null
          razao_social?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      estoques: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          empresa_id: string
          endereco: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          empresa_id: string
          endereco?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          empresa_id?: string
          endereco?: string | null
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "estoques_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          cidade: string | null
          cnpj: string | null
          created_at: string | null
          email: string | null
          empresa_id: string
          id: string
          nome_fantasia: string | null
          observacoes: string | null
          razao_social: string
          telefone: string | null
          uf: string | null
          updated_at: string | null
        }
        Insert: {
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          empresa_id: string
          id?: string
          nome_fantasia?: string | null
          observacoes?: string | null
          razao_social: string
          telefone?: string | null
          uf?: string | null
          updated_at?: string | null
        }
        Update: {
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          empresa_id?: string
          id?: string
          nome_fantasia?: string | null
          observacoes?: string | null
          razao_social?: string
          telefone?: string | null
          uf?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fornecedores_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      imeis: {
        Row: {
          created_at: string | null
          custo: number | null
          estoque_id: string | null
          fornecedor: string | null
          id: string
          imei: string
          preco: number | null
          produto_id: string
          status: string
          updated_at: string | null
          venda_id: string | null
        }
        Insert: {
          created_at?: string | null
          custo?: number | null
          estoque_id?: string | null
          fornecedor?: string | null
          id?: string
          imei: string
          preco?: number | null
          produto_id: string
          status?: string
          updated_at?: string | null
          venda_id?: string | null
        }
        Update: {
          created_at?: string | null
          custo?: number | null
          estoque_id?: string | null
          fornecedor?: string | null
          id?: string
          imei?: string
          preco?: number | null
          produto_id?: string
          status?: string
          updated_at?: string | null
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_imei_venda"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imeis_estoque_id_fkey"
            columns: ["estoque_id"]
            isOneToOne: false
            referencedRelation: "estoques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imeis_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imeis_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "v_estoque_consolidado"
            referencedColumns: ["produto_id"]
          },
        ]
      }
      integracoes: {
        Row: {
          config: Json | null
          created_at: string | null
          empresa_id: string
          estado: string
          grupo: string
          id: string
          nome: string
          ultima_sincronizacao: string | null
          ultimo_erro: string | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          empresa_id: string
          estado?: string
          grupo: string
          id?: string
          nome: string
          ultima_sincronizacao?: string | null
          ultimo_erro?: string | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          empresa_id?: string
          estado?: string
          grupo?: string
          id?: string
          nome?: string
          ultima_sincronizacao?: string | null
          ultimo_erro?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integracoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      investimentos_anuncio: {
        Row: {
          canal: string
          created_at: string | null
          empresa_id: string | null
          id: string
          mes: string
          valor: number
        }
        Insert: {
          canal: string
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          mes: string
          valor?: number
        }
        Update: {
          canal?: string
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          mes?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "investimentos_anuncio_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_eventos: {
        Row: {
          autor: string | null
          created_at: string | null
          empresa_id: string
          id: string
          lead_id: string
          texto: string | null
          tipo: string | null
        }
        Insert: {
          autor?: string | null
          created_at?: string | null
          empresa_id: string
          id?: string
          lead_id: string
          texto?: string | null
          tipo?: string | null
        }
        Update: {
          autor?: string | null
          created_at?: string | null
          empresa_id?: string
          id?: string
          lead_id?: string
          texto?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_eventos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_eventos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          anuncio_id: string | null
          anuncio_nome: string | null
          atribuido_em: string | null
          canal: string | null
          capi_compra_em: string | null
          capi_erro: string | null
          capi_lead_em: string | null
          cliente_id: string | null
          created_at: string | null
          ctwa_clid: string | null
          email: string | null
          empresa_id: string | null
          etapa: string | null
          follow_n: number | null
          ganho_em: string | null
          historico: boolean | null
          ia_analise: Json | null
          ia_em: string | null
          ia_venda_detectada: boolean | null
          ia_venda_valor: number | null
          id: string
          interesse: string | null
          kommo_id: string | null
          motivo_perda: string | null
          nome: string
          observacoes: string | null
          origem: string | null
          origem_detalhe: string | null
          pagamento: string | null
          primeira_resposta: string | null
          proxima_acao: string | null
          proxima_data: string | null
          proximo_contato: string | null
          qualificado: boolean | null
          repassado: boolean | null
          responsavel: string | null
          swap_dados: boolean | null
          telefone: string | null
          tipo: string | null
          ultimo_contato: string | null
          updated_at: string | null
          valor_estimado: number | null
          valor_venda: number | null
          venda_id: string | null
        }
        Insert: {
          anuncio_id?: string | null
          anuncio_nome?: string | null
          atribuido_em?: string | null
          canal?: string | null
          capi_compra_em?: string | null
          capi_erro?: string | null
          capi_lead_em?: string | null
          cliente_id?: string | null
          created_at?: string | null
          ctwa_clid?: string | null
          email?: string | null
          empresa_id?: string | null
          etapa?: string | null
          follow_n?: number | null
          ganho_em?: string | null
          historico?: boolean | null
          ia_analise?: Json | null
          ia_em?: string | null
          ia_venda_detectada?: boolean | null
          ia_venda_valor?: number | null
          id?: string
          interesse?: string | null
          kommo_id?: string | null
          motivo_perda?: string | null
          nome: string
          observacoes?: string | null
          origem?: string | null
          origem_detalhe?: string | null
          pagamento?: string | null
          primeira_resposta?: string | null
          proxima_acao?: string | null
          proxima_data?: string | null
          proximo_contato?: string | null
          qualificado?: boolean | null
          repassado?: boolean | null
          responsavel?: string | null
          swap_dados?: boolean | null
          telefone?: string | null
          tipo?: string | null
          ultimo_contato?: string | null
          updated_at?: string | null
          valor_estimado?: number | null
          valor_venda?: number | null
          venda_id?: string | null
        }
        Update: {
          anuncio_id?: string | null
          anuncio_nome?: string | null
          atribuido_em?: string | null
          canal?: string | null
          capi_compra_em?: string | null
          capi_erro?: string | null
          capi_lead_em?: string | null
          cliente_id?: string | null
          created_at?: string | null
          ctwa_clid?: string | null
          email?: string | null
          empresa_id?: string | null
          etapa?: string | null
          follow_n?: number | null
          ganho_em?: string | null
          historico?: boolean | null
          ia_analise?: Json | null
          ia_em?: string | null
          ia_venda_detectada?: boolean | null
          ia_venda_valor?: number | null
          id?: string
          interesse?: string | null
          kommo_id?: string | null
          motivo_perda?: string | null
          nome?: string
          observacoes?: string | null
          origem?: string | null
          origem_detalhe?: string | null
          pagamento?: string | null
          primeira_resposta?: string | null
          proxima_acao?: string | null
          proxima_data?: string | null
          proximo_contato?: string | null
          qualificado?: boolean | null
          repassado?: boolean | null
          responsavel?: string | null
          swap_dados?: boolean | null
          telefone?: string | null
          tipo?: string | null
          ultimo_contato?: string | null
          updated_at?: string | null
          valor_estimado?: number | null
          valor_venda?: number | null
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          acao: string
          created_at: string | null
          dados: Json | null
          detalhe: string | null
          empresa_id: string
          entidade: string | null
          entidade_id: string | null
          id: string
          ip: string | null
          usuario_id: string | null
          usuario_nome: string | null
        }
        Insert: {
          acao: string
          created_at?: string | null
          dados?: Json | null
          detalhe?: string | null
          empresa_id: string
          entidade?: string | null
          entidade_id?: string | null
          id?: string
          ip?: string | null
          usuario_id?: string | null
          usuario_nome?: string | null
        }
        Update: {
          acao?: string
          created_at?: string | null
          dados?: Json | null
          detalhe?: string | null
          empresa_id?: string
          entidade?: string | null
          entidade_id?: string | null
          id?: string
          ip?: string | null
          usuario_id?: string | null
          usuario_nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logs_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      martinha_envios: {
        Row: {
          dia: string
          enviado_em: string
          tipo: string
        }
        Insert: {
          dia: string
          enviado_em?: string
          tipo: string
        }
        Update: {
          dia?: string
          enviado_em?: string
          tipo?: string
        }
        Relationships: []
      }
      mensagens: {
        Row: {
          autor: string | null
          conversa_id: string
          created_at: string | null
          direcao: string
          empresa_id: string
          ext_id: string | null
          id: string
          midia_mime: string | null
          midia_nome: string | null
          midia_path: string | null
          midia_tamanho: number | null
          resposta_a: string | null
          status: string | null
          texto: string | null
          tipo: string | null
        }
        Insert: {
          autor?: string | null
          conversa_id: string
          created_at?: string | null
          direcao: string
          empresa_id: string
          ext_id?: string | null
          id?: string
          midia_mime?: string | null
          midia_nome?: string | null
          midia_path?: string | null
          midia_tamanho?: number | null
          resposta_a?: string | null
          status?: string | null
          texto?: string | null
          tipo?: string | null
        }
        Update: {
          autor?: string | null
          conversa_id?: string
          created_at?: string | null
          direcao?: string
          empresa_id?: string
          ext_id?: string | null
          id?: string
          midia_mime?: string | null
          midia_nome?: string | null
          midia_path?: string | null
          midia_tamanho?: number | null
          resposta_a?: string | null
          status?: string | null
          texto?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "conversas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      motoboys: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          empresa_id: string
          id: string
          nome: string
          telefone: string | null
          tipo: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          empresa_id: string
          id?: string
          nome: string
          telefone?: string | null
          tipo?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          empresa_id?: string
          id?: string
          nome?: string
          telefone?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "motoboys_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes: {
        Row: {
          created_at: string | null
          created_by: string | null
          custo_unitario: number | null
          empresa_id: string
          estoque_id: string
          id: string
          imei_id: string | null
          observacao: string | null
          produto_id: string
          quantidade: number
          referencia_id: string | null
          referencia_tipo: string | null
          tipo: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          custo_unitario?: number | null
          empresa_id: string
          estoque_id: string
          id?: string
          imei_id?: string | null
          observacao?: string | null
          produto_id: string
          quantidade: number
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          custo_unitario?: number | null
          empresa_id?: string
          estoque_id?: string
          id?: string
          imei_id?: string | null
          observacao?: string | null
          produto_id?: string
          quantidade?: number
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_estoque_id_fkey"
            columns: ["estoque_id"]
            isOneToOne: false
            referencedRelation: "estoques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_imei_id_fkey"
            columns: ["imei_id"]
            isOneToOne: false
            referencedRelation: "imeis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "v_estoque_consolidado"
            referencedColumns: ["produto_id"]
          },
        ]
      }
      movimentacoes_financeiras: {
        Row: {
          categoria: string | null
          created_at: string | null
          created_by: string | null
          data: string
          descricao: string | null
          empresa_id: string
          id: string
          referencia_id: string | null
          referencia_tipo: string | null
          tipo: string
          valor: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          created_by?: string | null
          data?: string
          descricao?: string | null
          empresa_id: string
          id?: string
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo: string
          valor: number
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          created_by?: string | null
          data?: string
          descricao?: string | null
          empresa_id?: string
          id?: string
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_financeiras_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_financeiras_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      nota_entrada_itens: {
        Row: {
          cfop: string | null
          created_at: string | null
          id: string
          ncm: string | null
          nota_entrada_id: string
          produto_id: string | null
          quantidade: number
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          cfop?: string | null
          created_at?: string | null
          id?: string
          ncm?: string | null
          nota_entrada_id: string
          produto_id?: string | null
          quantidade: number
          valor_total: number
          valor_unitario: number
        }
        Update: {
          cfop?: string | null
          created_at?: string | null
          id?: string
          ncm?: string | null
          nota_entrada_id?: string
          produto_id?: string | null
          quantidade?: number
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "nota_entrada_itens_nota_entrada_id_fkey"
            columns: ["nota_entrada_id"]
            isOneToOne: false
            referencedRelation: "notas_entrada"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nota_entrada_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nota_entrada_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "v_estoque_consolidado"
            referencedColumns: ["produto_id"]
          },
        ]
      }
      notas_entrada: {
        Row: {
          cbs: number | null
          chave_acesso: string | null
          created_at: string | null
          credito_tributario: number | null
          data_chegada: string | null
          data_emissao: string | null
          empresa_id: string
          estoque_destino_id: string | null
          fornecedor_id: string | null
          ibs: number | null
          id: string
          ipi: number | null
          iss: number | null
          numero: string
          observacao: string | null
          outras_despesas: number | null
          serie: string | null
          st: number | null
          status: string
          updated_at: string | null
          valor_frete: number | null
          valor_produtos: number | null
          valor_seguro: number | null
          valor_total: number | null
          xml: string | null
        }
        Insert: {
          cbs?: number | null
          chave_acesso?: string | null
          created_at?: string | null
          credito_tributario?: number | null
          data_chegada?: string | null
          data_emissao?: string | null
          empresa_id: string
          estoque_destino_id?: string | null
          fornecedor_id?: string | null
          ibs?: number | null
          id?: string
          ipi?: number | null
          iss?: number | null
          numero: string
          observacao?: string | null
          outras_despesas?: number | null
          serie?: string | null
          st?: number | null
          status?: string
          updated_at?: string | null
          valor_frete?: number | null
          valor_produtos?: number | null
          valor_seguro?: number | null
          valor_total?: number | null
          xml?: string | null
        }
        Update: {
          cbs?: number | null
          chave_acesso?: string | null
          created_at?: string | null
          credito_tributario?: number | null
          data_chegada?: string | null
          data_emissao?: string | null
          empresa_id?: string
          estoque_destino_id?: string | null
          fornecedor_id?: string | null
          ibs?: number | null
          id?: string
          ipi?: number | null
          iss?: number | null
          numero?: string
          observacao?: string | null
          outras_despesas?: number | null
          serie?: string | null
          st?: number | null
          status?: string
          updated_at?: string | null
          valor_frete?: number | null
          valor_produtos?: number | null
          valor_seguro?: number | null
          valor_total?: number | null
          xml?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_entrada_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_entrada_estoque_destino_id_fkey"
            columns: ["estoque_destino_id"]
            isOneToOne: false
            referencedRelation: "estoques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_entrada_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_saida: {
        Row: {
          chave_acesso: string | null
          created_at: string | null
          danfe: string | null
          data_autorizacao: string | null
          data_emissao: string | null
          destinatario: string | null
          destinatario_doc: string | null
          empresa_id: string
          erro: string | null
          id: string
          incluir_cpf: boolean | null
          motivo_cancelamento: string | null
          numero: string | null
          operacao: string | null
          protocolo: string | null
          ref_focus: string | null
          serie: string | null
          status: string
          tipo: string
          troca_id: string | null
          updated_at: string | null
          valor: number | null
          venda_id: string | null
          xml: string | null
        }
        Insert: {
          chave_acesso?: string | null
          created_at?: string | null
          danfe?: string | null
          data_autorizacao?: string | null
          data_emissao?: string | null
          destinatario?: string | null
          destinatario_doc?: string | null
          empresa_id: string
          erro?: string | null
          id?: string
          incluir_cpf?: boolean | null
          motivo_cancelamento?: string | null
          numero?: string | null
          operacao?: string | null
          protocolo?: string | null
          ref_focus?: string | null
          serie?: string | null
          status?: string
          tipo?: string
          troca_id?: string | null
          updated_at?: string | null
          valor?: number | null
          venda_id?: string | null
          xml?: string | null
        }
        Update: {
          chave_acesso?: string | null
          created_at?: string | null
          danfe?: string | null
          data_autorizacao?: string | null
          data_emissao?: string | null
          destinatario?: string | null
          destinatario_doc?: string | null
          empresa_id?: string
          erro?: string | null
          id?: string
          incluir_cpf?: boolean | null
          motivo_cancelamento?: string | null
          numero?: string | null
          operacao?: string | null
          protocolo?: string | null
          ref_focus?: string | null
          serie?: string | null
          status?: string
          tipo?: string
          troca_id?: string | null
          updated_at?: string | null
          valor?: number | null
          venda_id?: string | null
          xml?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_saida_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_saida_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      parametros_fiscais: {
        Row: {
          aliq_tributos_aprox: number | null
          aliquota_cbs: number | null
          aliquota_ibs: number | null
          ambiente_fiscal: string | null
          certificado_digital_validade: string | null
          empresa_id: string
          id: string
          proximo_numero_nfce: number | null
          proximo_numero_nfe: number | null
          regime: string | null
          serie_nfce: string | null
          serie_nfe: string | null
          updated_at: string | null
        }
        Insert: {
          aliq_tributos_aprox?: number | null
          aliquota_cbs?: number | null
          aliquota_ibs?: number | null
          ambiente_fiscal?: string | null
          certificado_digital_validade?: string | null
          empresa_id: string
          id?: string
          proximo_numero_nfce?: number | null
          proximo_numero_nfe?: number | null
          regime?: string | null
          serie_nfce?: string | null
          serie_nfe?: string | null
          updated_at?: string | null
        }
        Update: {
          aliq_tributos_aprox?: number | null
          aliquota_cbs?: number | null
          aliquota_ibs?: number | null
          ambiente_fiscal?: string | null
          certificado_digital_validade?: string | null
          empresa_id?: string
          id?: string
          proximo_numero_nfce?: number | null
          proximo_numero_nfe?: number | null
          regime?: string | null
          serie_nfce?: string | null
          serie_nfe?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parametros_fiscais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      parceiros: {
        Row: {
          comissao_fixo: number | null
          comissao_pct: number | null
          comissao_tipo: string | null
          created_at: string | null
          criterio: string | null
          desconto_pct: number | null
          dia_vencimento: number | null
          email: string | null
          empresa_id: string | null
          id: string
          nome: string
          pagamento_padrao: string | null
          parcelas_padrao: number | null
          telefone: string | null
          tipo: string
        }
        Insert: {
          comissao_fixo?: number | null
          comissao_pct?: number | null
          comissao_tipo?: string | null
          created_at?: string | null
          criterio?: string | null
          desconto_pct?: number | null
          dia_vencimento?: number | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nome: string
          pagamento_padrao?: string | null
          parcelas_padrao?: number | null
          telefone?: string | null
          tipo?: string
        }
        Update: {
          comissao_fixo?: number | null
          comissao_pct?: number | null
          comissao_tipo?: string | null
          created_at?: string | null
          criterio?: string | null
          desconto_pct?: number | null
          dia_vencimento?: number | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string
          pagamento_padrao?: string | null
          parcelas_padrao?: number | null
          telefone?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "parceiros_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          avisos: Json | null
          cliente_id: string | null
          cliente_nome: string | null
          cliente_tel: string | null
          codigo: string | null
          compra_obs: string | null
          created_at: string | null
          created_by: string | null
          empresa_id: string
          endereco: string | null
          entregue_em: string | null
          forma_pagamento: string | null
          id: string
          itens: string | null
          juros_total: number
          motoboy_id: string | null
          motoboy_nome: string | null
          obs: string | null
          pag_entrega: string | null
          parcelas: number | null
          precisa_compra: boolean | null
          previsao_min: number | null
          saiu_em: string | null
          status: string
          tipo_entrega: string
          total: number | null
          updated_at: string | null
          valor_receber: number | null
          venda_id: string | null
          vendedor_nome: string | null
        }
        Insert: {
          avisos?: Json | null
          cliente_id?: string | null
          cliente_nome?: string | null
          cliente_tel?: string | null
          codigo?: string | null
          compra_obs?: string | null
          created_at?: string | null
          created_by?: string | null
          empresa_id: string
          endereco?: string | null
          entregue_em?: string | null
          forma_pagamento?: string | null
          id?: string
          itens?: string | null
          juros_total?: number
          motoboy_id?: string | null
          motoboy_nome?: string | null
          obs?: string | null
          pag_entrega?: string | null
          parcelas?: number | null
          precisa_compra?: boolean | null
          previsao_min?: number | null
          saiu_em?: string | null
          status?: string
          tipo_entrega?: string
          total?: number | null
          updated_at?: string | null
          valor_receber?: number | null
          venda_id?: string | null
          vendedor_nome?: string | null
        }
        Update: {
          avisos?: Json | null
          cliente_id?: string | null
          cliente_nome?: string | null
          cliente_tel?: string | null
          codigo?: string | null
          compra_obs?: string | null
          created_at?: string | null
          created_by?: string | null
          empresa_id?: string
          endereco?: string | null
          entregue_em?: string | null
          forma_pagamento?: string | null
          id?: string
          itens?: string | null
          juros_total?: number
          motoboy_id?: string | null
          motoboy_nome?: string | null
          obs?: string | null
          pag_entrega?: string | null
          parcelas?: number | null
          precisa_compra?: boolean | null
          previsao_min?: number | null
          saiu_em?: string | null
          status?: string
          tipo_entrega?: string
          total?: number | null
          updated_at?: string | null
          valor_receber?: number | null
          venda_id?: string | null
          vendedor_nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_motoboy_id_fkey"
            columns: ["motoboy_id"]
            isOneToOne: false
            referencedRelation: "motoboys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      produto_estoque: {
        Row: {
          estoque_id: string
          id: string
          produto_id: string
          quantidade: number
          updated_at: string | null
        }
        Insert: {
          estoque_id: string
          id?: string
          produto_id: string
          quantidade?: number
          updated_at?: string | null
        }
        Update: {
          estoque_id?: string
          id?: string
          produto_id?: string
          quantidade?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produto_estoque_estoque_id_fkey"
            columns: ["estoque_id"]
            isOneToOne: false
            referencedRelation: "estoques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produto_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produto_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "v_estoque_consolidado"
            referencedColumns: ["produto_id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean | null
          categoria_id: string | null
          cest: string | null
          cfop_saida: string | null
          controla_imei: boolean | null
          created_at: string | null
          custo: number
          descricao: string | null
          empresa_id: string
          estoque_maximo: number | null
          estoque_minimo: number | null
          fornecedor_id: string | null
          foto_url: string | null
          icms_st: boolean | null
          id: string
          marca: string | null
          modelo: string | null
          ncm: string | null
          nome: string
          preco: number
          sku: string | null
          unidade: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria_id?: string | null
          cest?: string | null
          cfop_saida?: string | null
          controla_imei?: boolean | null
          created_at?: string | null
          custo?: number
          descricao?: string | null
          empresa_id: string
          estoque_maximo?: number | null
          estoque_minimo?: number | null
          fornecedor_id?: string | null
          foto_url?: string | null
          icms_st?: boolean | null
          id?: string
          marca?: string | null
          modelo?: string | null
          ncm?: string | null
          nome: string
          preco?: number
          sku?: string | null
          unidade?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria_id?: string | null
          cest?: string | null
          cfop_saida?: string | null
          controla_imei?: boolean | null
          created_at?: string | null
          custo?: number
          descricao?: string | null
          empresa_id?: string
          estoque_maximo?: number | null
          estoque_minimo?: number | null
          fornecedor_id?: string | null
          foto_url?: string | null
          icms_st?: boolean | null
          id?: string
          marca?: string | null
          modelo?: string | null
          ncm?: string | null
          nome?: string
          preco?: number
          sku?: string | null
          unidade?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          data: string | null
          empresa_id: string | null
          feito: boolean | null
          id: string
          lead_id: string | null
          mensagem: string | null
          responsavel: string | null
          tipo: string | null
          titulo: string
          venda_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          data?: string | null
          empresa_id?: string | null
          feito?: boolean | null
          id?: string
          lead_id?: string | null
          mensagem?: string | null
          responsavel?: string | null
          tipo?: string | null
          titulo: string
          venda_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          data?: string | null
          empresa_id?: string | null
          feito?: boolean | null
          id?: string
          lead_id?: string | null
          mensagem?: string | null
          responsavel?: string | null
          tipo?: string | null
          titulo?: string
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      trocas: {
        Row: {
          aparelho: string
          created_at: string | null
          custo_manutencao: number | null
          custo_motoboy: number | null
          custo_total: number | null
          empresa_id: string | null
          estado: string | null
          id: string
          imei: string | null
          outros_custos: number | null
          preco_revenda: number | null
          produto_id: string | null
          valor_avaliacao: number | null
          venda_id: string | null
        }
        Insert: {
          aparelho: string
          created_at?: string | null
          custo_manutencao?: number | null
          custo_motoboy?: number | null
          custo_total?: number | null
          empresa_id?: string | null
          estado?: string | null
          id?: string
          imei?: string | null
          outros_custos?: number | null
          preco_revenda?: number | null
          produto_id?: string | null
          valor_avaliacao?: number | null
          venda_id?: string | null
        }
        Update: {
          aparelho?: string
          created_at?: string | null
          custo_manutencao?: number | null
          custo_motoboy?: number | null
          custo_total?: number | null
          empresa_id?: string | null
          estado?: string | null
          id?: string
          imei?: string | null
          outros_custos?: number | null
          preco_revenda?: number | null
          produto_id?: string | null
          valor_avaliacao?: number | null
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trocas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trocas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trocas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "v_estoque_consolidado"
            referencedColumns: ["produto_id"]
          },
          {
            foreignKeyName: "trocas_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string
          empresa_id: string
          id: string
          nome: string
          papel: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email: string
          empresa_id: string
          id: string
          nome: string
          papel?: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string
          empresa_id?: string
          id?: string
          nome?: string
          papel?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      venda_itens: {
        Row: {
          created_at: string | null
          custo_unitario: number
          desconto: number | null
          estoque_id: string | null
          id: string
          imei_id: string | null
          preco_unitario: number
          produto_id: string
          quantidade: number
          total: number
          venda_id: string
        }
        Insert: {
          created_at?: string | null
          custo_unitario: number
          desconto?: number | null
          estoque_id?: string | null
          id?: string
          imei_id?: string | null
          preco_unitario: number
          produto_id: string
          quantidade?: number
          total: number
          venda_id: string
        }
        Update: {
          created_at?: string | null
          custo_unitario?: number
          desconto?: number | null
          estoque_id?: string | null
          id?: string
          imei_id?: string | null
          preco_unitario?: number
          produto_id?: string
          quantidade?: number
          total?: number
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venda_itens_estoque_id_fkey"
            columns: ["estoque_id"]
            isOneToOne: false
            referencedRelation: "estoques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venda_itens_imei_id_fkey"
            columns: ["imei_id"]
            isOneToOne: false
            referencedRelation: "imeis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venda_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venda_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "v_estoque_consolidado"
            referencedColumns: ["produto_id"]
          },
          {
            foreignKeyName: "venda_itens_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      venda_pagamentos: {
        Row: {
          created_at: string | null
          forma: string
          id: string
          juros: number
          parcelas: number | null
          valor: number
          venda_id: string
        }
        Insert: {
          created_at?: string | null
          forma: string
          id?: string
          juros?: number
          parcelas?: number | null
          valor: number
          venda_id: string
        }
        Update: {
          created_at?: string | null
          forma?: string
          id?: string
          juros?: number
          parcelas?: number | null
          valor?: number
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venda_pagamentos_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      vendas: {
        Row: {
          acrescimo: number | null
          canal: string | null
          cliente_id: string | null
          codigo: string
          comissao_pct: number | null
          comissao_valor: number | null
          created_at: string | null
          created_by: string | null
          custo_total: number | null
          data_venda: string | null
          desconto: number | null
          empresa_id: string
          id: string
          margem_pct: number | null
          margem_valor: number | null
          observacao: string | null
          origem: string | null
          parceiro_id: string | null
          parceiro_nome: string | null
          status: string
          subtotal: number
          taxa_entrega: number
          total: number
          updated_at: string | null
          valor_entrada: number | null
          vendedor_comissao: number | null
          vendedor_id: string | null
          vendedor_nome: string | null
        }
        Insert: {
          acrescimo?: number | null
          canal?: string | null
          cliente_id?: string | null
          codigo: string
          comissao_pct?: number | null
          comissao_valor?: number | null
          created_at?: string | null
          created_by?: string | null
          custo_total?: number | null
          data_venda?: string | null
          desconto?: number | null
          empresa_id: string
          id?: string
          margem_pct?: number | null
          margem_valor?: number | null
          observacao?: string | null
          origem?: string | null
          parceiro_id?: string | null
          parceiro_nome?: string | null
          status?: string
          subtotal?: number
          taxa_entrega?: number
          total?: number
          updated_at?: string | null
          valor_entrada?: number | null
          vendedor_comissao?: number | null
          vendedor_id?: string | null
          vendedor_nome?: string | null
        }
        Update: {
          acrescimo?: number | null
          canal?: string | null
          cliente_id?: string | null
          codigo?: string
          comissao_pct?: number | null
          comissao_valor?: number | null
          created_at?: string | null
          created_by?: string | null
          custo_total?: number | null
          data_venda?: string | null
          desconto?: number | null
          empresa_id?: string
          id?: string
          margem_pct?: number | null
          margem_valor?: number | null
          observacao?: string | null
          origem?: string | null
          parceiro_id?: string | null
          parceiro_nome?: string | null
          status?: string
          subtotal?: number
          taxa_entrega?: number
          total?: number
          updated_at?: string | null
          valor_entrada?: number | null
          vendedor_comissao?: number | null
          vendedor_id?: string | null
          vendedor_nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "parceiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      vendedores: {
        Row: {
          comissao_pct: number | null
          comissao_tipo: string | null
          comissao_valor: number | null
          created_at: string | null
          email: string | null
          empresa_id: string | null
          id: string
          meta_mensal: number | null
          nome: string
          rodizio: boolean | null
          telefone: string | null
        }
        Insert: {
          comissao_pct?: number | null
          comissao_tipo?: string | null
          comissao_valor?: number | null
          created_at?: string | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          meta_mensal?: number | null
          nome: string
          rodizio?: boolean | null
          telefone?: string | null
        }
        Update: {
          comissao_pct?: number | null
          comissao_tipo?: string | null
          comissao_valor?: number | null
          created_at?: string | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          meta_mensal?: number | null
          nome?: string
          rodizio?: boolean | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendedores_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      auditoria_estoque: {
        Row: {
          alerta: string | null
          estoque: string | null
          nome: string | null
          quantidade: number | null
        }
        Relationships: []
      }
      v_contas_vencidas: {
        Row: {
          empresa_id: string | null
          id: string | null
          status: string | null
          tipo: string | null
          valor: number | null
          vencimento: string | null
        }
        Relationships: []
      }
      v_estoque_consolidado: {
        Row: {
          categoria: string | null
          controla_imei: boolean | null
          custo: number | null
          estoque_minimo: number | null
          estoque_total: number | null
          margem_pct: number | null
          nome: string | null
          preco: number | null
          produto_id: string | null
          sku: string | null
          status_estoque: string | null
        }
        Relationships: []
      }
      v_vendas_resumo: {
        Row: {
          dia: string | null
          empresa_id: string | null
          faturamento: number | null
          lucro: number | null
          margem_media: number | null
          ticket_medio: number | null
          total_vendas: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vendas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      baixar_entrega: { Args: { p_pedido: string }; Returns: number }
      cat_gestor: { Args: { eid: string }; Returns: boolean }
      cat_membro: { Args: { eid: string }; Returns: boolean }
      cat_papel: { Args: { eid: string }; Returns: string }
      empresa_existe: { Args: { eid: string }; Returns: boolean }
      registrar_venda: { Args: { p: Json }; Returns: Json }
      user_empresa_id: { Args: never; Returns: string }
      user_nome: { Args: never; Returns: string }
      user_papel: { Args: never; Returns: string }
      vincular_venda_lead: { Args: { p_venda: string }; Returns: string }
      zz_teste_baixar_entrega: { Args: { p_pedido: string }; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
