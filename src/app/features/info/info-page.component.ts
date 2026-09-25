import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

interface InfoSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

interface InfoContent {
  title: string;
  intro: string;
  updated: string;
  sections: InfoSection[];
}

type InfoKey = "about" | "exchanges" | "privacy" | "terms";

@Component({
  selector: "app-info-page",
  standalone: true,
  imports: [],
  templateUrl: "./info-page.component.html",
  styleUrls: ["./info-page.component.scss"],
})
export class InfoPageComponent {
  readonly route = inject(ActivatedRoute);
  readonly pages: Record<InfoKey, InfoContent> = {
    about: {
      title: "Sobre Nós",
      intro:
        "Moda escolhida com critério, atendimento próximo e compromisso com quem compra em Angola.",
      updated: "Apresentação institucional",
      sections: [
        {
          title: "Quem somos",
          paragraphs: [
            "A Bravo Business é uma loja angolana de moda, calçados e acessórios, criada para tornar a compra de peças marcantes mais simples, clara e confiável.",
            "Trabalhamos com uma selecção orientada por qualidade, utilidade, acabamento e identidade. Cada produto apresentado no catálogo deve justificar o seu lugar na colecção e ser descrito de forma compreensível.",
          ],
        },
        {
          title: "A nossa visão",
          paragraphs: [
            "Ser uma referência de confiança no comércio de moda em Angola, aproximando produtos bem escolhidos de clientes que valorizam estilo, serviço e transparência.",
          ],
        },
        {
          title: "Os nossos valores",
          bullets: [
            "Transparência: informação clara sobre produto, preço, disponibilidade e condições de compra.",
            "Qualidade: escolha responsável e atenção ao estado e à apresentação dos artigos.",
            "Respeito: atendimento profissional, inclusivo e orientado para uma solução justa.",
            "Responsabilidade: tratamento cuidadoso dos dados e cumprimento das obrigações aplicáveis.",
            "Proximidade: comunicação directa para esclarecer dúvidas antes e depois da compra.",
          ],
        },
        {
          title: "Como trabalhamos",
          paragraphs: [
            "A loja permite descobrir produtos online e iniciar o pedido através do WhatsApp. Antes da confirmação, validamos disponibilidade, preço, local de entrega, prazo e forma de pagamento com o cliente.",
            "A confirmação enviada pela Bravo Business é o momento em que os detalhes do pedido ficam definidos. Até essa confirmação, um produto no carrinho ou nos favoritos não constitui reserva nem compra concluída.",
          ],
        },
        {
          title: "Contacto",
          paragraphs: [
            "Para informações, reclamações ou sugestões, fala connosco pelo WhatsApp +244 957 10 36 56 ou através da página Contactos. Procuramos responder com clareza e dentro de um prazo razoável.",
          ],
        },
      ],
    },
    exchanges: {
      title: "Política de Trocas",
      intro:
        "Uma política clara para resolver trocas com rapidez, equilíbrio e respeito pelos direitos do consumidor.",
      updated: "Última revisão: 25/09/2026",
      sections: [
        {
          title: "1. Prazo para solicitar",
          paragraphs: [
            "O cliente pode solicitar uma troca até 7 dias corridos após a recepção do produto. O pedido deve ser feito pelo WhatsApp ou por outro canal oficial, indicando o número ou referência da encomenda, o produto e o motivo da solicitação.",
            "O prazo conta a partir da entrega comunicada ao cliente. Contactos feitos depois desse prazo podem ser analisados excepcionalmente, mas não garantem aceitação.",
          ],
        },
        {
          title: "2. Condições do produto",
          paragraphs: [
            "Para ser aceite, o artigo deve ser devolvido sem sinais de uso, lavagem, alteração, dano, perfume intenso ou remoção de etiquetas e embalagem que façam parte da apresentação do produto.",
          ],
          bullets: [
            "O artigo deve corresponder ao que foi entregue e ser acompanhado dos acessórios recebidos.",
            "A Bravo Business pode solicitar fotografias para uma triagem inicial.",
            "A análise final é feita quando o produto chega ao ponto combinado ou é recolhido.",
          ],
        },
        {
          title: "3. Produtos com defeito ou erro no pedido",
          paragraphs: [
            "Se o produto apresentar defeito de origem, dano ocorrido antes da entrega ou não corresponder ao pedido confirmado, o cliente deve comunicar a situação assim que a detectar, preferencialmente com fotografias e descrição do problema.",
            "Nesses casos, a Bravo Business procurará reparar a situação através de substituição, correcção do pedido ou outra solução legalmente adequada, sem prejuízo dos direitos previstos na legislação aplicável ao consumidor.",
          ],
        },
        {
          title: "4. Produtos excluídos e custos",
          paragraphs: [
            "Artigos personalizados, usados, danificados por utilização inadequada ou alterados pelo cliente não são elegíveis para troca por motivo de preferência, salvo quando exista defeito ou desconformidade imputável à loja.",
            "Em trocas por preferência, tamanho ou mudança de decisão, os custos de deslocação, recolha ou nova entrega podem ser suportados pelo cliente, quando previamente informados. Em erro da loja ou defeito confirmado, a Bravo Business assumirá os custos razoáveis de resolução.",
          ],
        },
        {
          title: "5. Procedimento e reembolso",
          paragraphs: [
            "Nenhum produto deve ser enviado sem instruções da equipa. Depois da análise, comunicaremos a decisão e os próximos passos. Quando a troca não for possível e houver lugar a reembolso, o método e o prazo serão acordados com o cliente de acordo com o meio de pagamento utilizado e a legislação aplicável.",
            "Esta política não limita direitos imperativos conferidos ao consumidor pela lei angolana.",
          ],
        },
      ],
    },
    privacy: {
      title: "Política de Privacidade",
      intro:
        "Explicamos que dados recolhemos, para que os usamos e como podes exercer os teus direitos.",
      updated: "Última revisão: 25/09/2026",
      sections: [
        {
          title: "1. Responsável pelo tratamento",
          paragraphs: [
            "A Bravo Business é responsável pelo tratamento dos dados pessoais recolhidos através desta loja e dos canais oficiais de atendimento. Os dados de identificação empresarial e fiscais devem ser completados nos documentos comerciais oficiais da empresa antes da publicação definitiva desta política.",
          ],
        },
        {
          title: "2. Dados que podem ser tratados",
          bullets: [
            "Nome, número de telefone e dados necessários para responder a pedidos feitos pelo WhatsApp.",
            "Informação sobre produtos pretendidos, encomendas, entregas, trocas, reclamações e comunicações de apoio.",
            "Dados técnicos essenciais para funcionamento e segurança do site, quando disponibilizados pelo navegador ou fornecedor de alojamento.",
            "Preferências guardadas localmente no dispositivo, como carrinho, favoritos e tema visual. Estes dados não são enviados automaticamente para a Bravo Business.",
          ],
        },
        {
          title: "3. Finalidades e fundamento",
          paragraphs: [
            "Usamos os dados para responder a pedidos, confirmar disponibilidade, preparar e acompanhar encomendas, tratar trocas e reclamações, prestar apoio e cumprir obrigações legais ou de segurança. Não vendemos dados pessoais nem os usamos para finalidades incompatíveis com estas sem informação e base adequada.",
            "Quando o contacto é iniciado pelo cliente no WhatsApp, a comunicação também fica sujeita às políticas e aos termos desse fornecedor. Recomendamos que não envies dados excessivos ou informações sensíveis pelo chat.",
          ],
        },
        {
          title: "4. Partilha e conservação",
          paragraphs: [
            "Os dados podem ser acessíveis a prestadores que apoiem alojamento, comunicações, entrega ou operação técnica, apenas na medida necessária e sob deveres de confidencialidade. Poderemos conservar informação pelo período necessário à finalidade, à resolução de litígios e ao cumprimento de obrigações legais.",
          ],
        },
        {
          title: "5. Direitos do titular",
          paragraphs: [
            "Nos termos da legislação aplicável, incluindo a legislação angolana de protecção de dados pessoais, podes solicitar informação sobre o tratamento, actualização, correcção ou eliminação dos teus dados, quando legalmente possível. Para exercer um direito, contacta-nos pelo WhatsApp +244 957 10 36 56, indicando o pedido e um meio para resposta.",
            "Podemos pedir elementos razoáveis para confirmar a identidade e evitar acesso indevido. Se entenderes que o pedido não foi tratado adequadamente, poderás recorrer à autoridade competente ou a outros meios previstos na lei.",
          ],
        },
        {
          title: "6. Segurança e actualizações",
          paragraphs: [
            "Aplicamos medidas razoáveis para reduzir acessos indevidos, perda ou alteração de informação. Nenhum canal digital é absolutamente seguro. Esta política pode ser actualizada para reflectir mudanças legais, técnicas ou operacionais; a versão publicada nesta página será a aplicável a partir da data indicada.",
          ],
        },
      ],
    },
    terms: {
      title: "Termos & Condições",
      intro:
        "Condições de utilização do catálogo online e de confirmação de encomendas da Bravo Business.",
      updated: "Última revisão: 25/09/2026",
      sections: [
        {
          title: "1. Âmbito",
          paragraphs: [
            "Estes termos regulam a utilização do catálogo online Bravo Business, o contacto comercial iniciado através do site e as encomendas confirmadas pela nossa equipa. Ao navegar, guardar produtos ou enviar um pedido, o utilizador declara que leu estes termos e que fornecerá informação verdadeira e actualizada.",
          ],
        },
        {
          title: "2. Catálogo, imagens e preços",
          paragraphs: [
            "Fazemos esforços para que nomes, imagens, cores, medidas, descrições e preços sejam correctos. Podem existir diferenças de visualização, erros materiais ou alterações de disponibilidade. O preço e as condições válidos para uma encomenda são os confirmados pela Bravo Business antes da conclusão.",
            "A inclusão de um produto no carrinho ou nos favoritos não constitui reserva, pagamento ou contrato de compra e venda.",
          ],
        },
        {
          title: "3. Pedido e formação do contrato",
          paragraphs: [
            "O envio de uma mensagem pelo WhatsApp representa um pedido de informação ou de encomenda, não uma aceitação automática. A encomenda só fica confirmada depois de a Bravo Business validar produto, quantidade, preço, entrega e pagamento com o cliente.",
            "Podemos recusar ou cancelar um pedido quando o artigo esteja indisponível, exista erro evidente de preço ou descrição, não seja possível validar os dados essenciais ou haja indícios de utilização abusiva do serviço. Nesses casos, comunicaremos a razão e devolveremos valores recebidos que não tenham fundamento para ser retidos.",
          ],
        },
        {
          title: "4. Pagamento, entrega e recepção",
          paragraphs: [
            "O meio de pagamento, custos de entrega, zona abrangida e prazo estimado serão informados e confirmados para cada pedido. O cliente deve fornecer dados de contacto e entrega correctos, garantir que alguém pode receber a encomenda e verificar o estado do artigo no momento da entrega, sempre que possível.",
            "Atrasos causados por informação incompleta, ausência do destinatário, restrições de acesso ou factos fora do controlo razoável da loja poderão alterar o prazo inicialmente estimado.",
          ],
        },
        {
          title: "5. Utilização aceitável",
          bullets: [
            "Não utilizar o site para fraude, assédio, tentativa de intrusão ou recolha indevida de dados.",
            "Não copiar, explorar comercialmente ou alterar conteúdos da loja sem autorização.",
            "Não fazer pedidos fictícios, repetidos ou destinados a perturbar a operação.",
            "Respeitar as regras da Política de Trocas e fornecer informação necessária de forma honesta.",
          ],
        },
        {
          title: "6. Responsabilidade e reclamações",
          paragraphs: [
            "A Bravo Business responde nos limites previstos na legislação aplicável por incumprimentos que lhe sejam imputáveis. Não responde por indisponibilidade temporária, falhas de terceiros, conteúdos externos ou eventos imprevisíveis fora do seu controlo, sem prejuízo de direitos imperativos do consumidor.",
            "Qualquer questão deve ser comunicada primeiro pelos canais oficiais para permitir análise e solução. Estes termos não excluem o direito de recorrer às entidades administrativas ou judiciais competentes em Angola.",
          ],
        },
        {
          title: "7. Lei aplicável e alterações",
          paragraphs: [
            "A relação será interpretada segundo a lei da República de Angola, sem prejuízo das normas imperativas de protecção do consumidor. Os termos podem ser actualizados; a versão publicada nesta página identifica a data da última revisão e aplica-se aos pedidos realizados depois dessa data.",
          ],
        },
      ],
    },
  };
  readonly page: InfoContent =
    this.pages[(this.route.snapshot.data["page"] as InfoKey) || "about"];
}
