import { Course, CourseLevel, CourseModality, CourseShift } from "@/types";

function makeCourse(
  id: string,
  institution: string,
  program: string,
  level: CourseLevel,
  modality: CourseModality,
  shift: CourseShift,
  area: string,
  city: string,
  state: string,
  duration: string,
  url: string,
  mecGrade: number | null,
  price: string | null,
  description: string,
  tags: string[]
): Course {
  return {
    id,
    institution,
    program,
    level,
    modality,
    shift,
    area,
    city,
    state,
    duration,
    url,
    mecRecognized: true,
    mecGrade,
    price,
    description,
    tags,
  };
}

const CURATED_COURSES: Course[] = [
  makeCourse(
    "ufpe-mestrado-cc",
    "UFPE - Centro de Informática (CIn)",
    "Mestrado Acadêmico em Ciência da Computação",
    "mestrado",
    "presencial",
    "flexivel",
    "Ciência da Computação",
    "Recife",
    "PE",
    "24 meses",
    "https://portal.cin.ufpe.br/pos-graduacao/stricto-sensu/programa-academico/",
    5,
    "Gratuito",
    "Programa de pós-graduação stricto sensu do CIn/UFPE com conceito CAPES 7 (nota máxima). Linhas de pesquisa em engenharia de software, IA, sistemas distribuídos, redes e mais. Possibilidade de bolsa CAPES/CNPq. Gratuito por ser universidade federal.",
    ["Gratuito", "CAPES 7", "Federal", "Bolsa", "Pesquisa"]
  ),
  makeCourse(
    "ufpe-mestrado-ec",
    "UFPE - Centro de Informática (CIn)",
    "Mestrado Acadêmico em Engenharia da Computação",
    "mestrado",
    "presencial",
    "flexivel",
    "Engenharia da Computação",
    "Recife",
    "PE",
    "24 meses",
    "https://portal.cin.ufpe.br/pos-graduacao/stricto-sensu/programa-academico/",
    5,
    "Gratuito",
    "Mestrado acadêmico em Engenharia da Computação no CIn/UFPE. Foco em sistemas embarcados, redes, computação em nuvem e engenharia de software. Conceito CAPES 7. Possibilidade de bolsa. Gratuito.",
    ["Gratuito", "CAPES 7", "Federal", "Bolsa", "Engenharia"]
  ),
  makeCourse(
    "ufpe-mestrado-prof",
    "UFPE - Centro de Informática (CIn)",
    "Mestrado Profissional em Ciência da Computação",
    "mestrado",
    "presencial",
    "flexivel",
    "Ciência da Computação",
    "Recife",
    "PE",
    "24 meses",
    "https://portal.cin.ufpe.br/pos-graduacao/stricto-sensu/programa-profissional/",
    5,
    "Gratuito",
    "Mestrado profissional stricto sensu do CIn/UFPE voltado a profissionais do mercado. Foco em pesquisa aplicada em engenharia de software, IA e sistemas. Gratuito por ser universidade federal pública.",
    ["Gratuito", "Federal", "Profissional", "Pesquisa Aplicada"]
  ),
  makeCourse(
    "ufpe-doutorado",
    "UFPE - Centro de Informática (CIn)",
    "Doutorado em Ciência da Computação",
    "doutorado",
    "presencial",
    "flexivel",
    "Ciência da Computação",
    "Recife",
    "PE",
    "48 meses",
    "https://portal.cin.ufpe.br/pos-graduacao/stricto-sensu/programa-academico/",
    5,
    "Gratuito",
    "Doutorado acadêmico do CIn/UFPE com conceito CAPES 7 (nota máxima no Brasil). Pesquisa de ponta em engenharia de software, inteligência artificial, segurança e mais. Possibilidade de bolsa CAPES/CNPq. Gratuito.",
    ["Gratuito", "CAPES 7", "Federal", "Bolsa", "Doutorado"]
  ),
  makeCourse(
    "ufpe-residencia-software",
    "UFPE - CIn (parceria Motorola)",
    "Residência em Software",
    "pos-graduacao",
    "presencial",
    "flexivel",
    "Engenharia de Software / Testes",
    "Recife",
    "PE",
    "12 meses",
    "https://portal.cin.ufpe.br/pos-graduacao/especializacoes-2/residencia-2/",
    5,
    "Gratuito + Bolsa",
    "Modelo pioneiro de residência em software criado no CIn/UFPE em parceria com a Motorola. Imersão em ambiente acadêmico e fábrica de software/teste. Foco em planejamento, automação e execução de testes em aplicações mobile. Gratuito com possibilidade de bolsa de pesquisa.",
    ["Gratuito", "Bolsa", "Residência", "Testes", "Mobile"]
  ),
  makeCourse(
    "ufpe-residencia-dev",
    "UFPE - CIn (parceria Emprel)",
    "Residência em Desenvolvimento de Software",
    "pos-graduacao",
    "presencial",
    "flexivel",
    "Desenvolvimento de Software",
    "Recife",
    "PE",
    "12 meses",
    "https://portal.cin.ufpe.br/pos-graduacao/especializacoes-2/residencia-2/",
    5,
    "Gratuito + Bolsa",
    "Programa de residência em desenvolvimento de software do CIn/UFPE em parceria com a Emprel. Objetivo de formar recursos humanos com alto grau de especialização em desenvolvimento de software. Gratuito com bolsa.",
    ["Gratuito", "Bolsa", "Residência", "Dev", "Software"]
  ),
  makeCourse(
    "ufpe-residencia-robotica",
    "UFPE - CIn (parceria Softex)",
    "Residência em Robótica e IA Aplicadas a Testes de Software",
    "pos-graduacao",
    "presencial",
    "flexivel",
    "IA / Testes de Software",
    "Recife",
    "PE",
    "12 meses",
    "https://residenciarobotica.cin.ufpe.br/",
    5,
    "Gratuito + Bolsa",
    "Residência do CIn/UFPE em parceria com Softex. Laboratórios equipados com robôs e materiais para prototipação. Foco em testes práticos, IA e desenvolvimento de software com impacto social. Gratuito com bolsa.",
    ["Gratuito", "Bolsa", "IA", "Robótica", "Testes"]
  ),
  makeCourse(
    "ufpe-residencia-dados",
    "UFPE - CIn (parceria Samsung)",
    "Residência em Engenharia e Ciência de Dados",
    "pos-graduacao",
    "presencial",
    "flexivel",
    "Ciência de Dados",
    "Recife",
    "PE",
    "12 meses",
    "https://portal.cin.ufpe.br/pos-graduacao/especializacoes-2/residencia-2/",
    5,
    "Gratuito + Bolsa",
    "Residência do CIn/UFPE em parceria com a Samsung (19 anos de parceria). Vivência em ambiente empresarial com base teórica de excelência em engenharia e ciência de dados. Gratuito com bolsa.",
    ["Gratuito", "Bolsa", "Dados", "Samsung", "Residência"]
  ),
  makeCourse(
    "ufpe-residencia-visao",
    "UFPE - CIn (parceria Samsung)",
    "Residência em Visão Computacional",
    "pos-graduacao",
    "presencial",
    "flexivel",
    "Visão Computacional / IA",
    "Recife",
    "PE",
    "12 meses",
    "https://portal.cin.ufpe.br/pos-graduacao/especializacoes-2/residencia-2/",
    5,
    "Gratuito + Bolsa",
    "Residência do CIn/UFPE em parceria com a Samsung. Capacitação em conceitos alinhados às demandas atuais do mercado de tecnologia. Foco em visão computacional e processamento de imagens. Gratuito com bolsa.",
    ["Gratuito", "Bolsa", "Visão Computacional", "IA", "Samsung"]
  ),
  makeCourse(
    "ufpe-residencia-auto-dev",
    "UFPE - CIn (parceria Stellantis)",
    "Residência em Desenvolvimento de Software para Setor Automotivo",
    "pos-graduacao",
    "presencial",
    "flexivel",
    "Engenharia de Software Automotivo",
    "Recife",
    "PE",
    "12 meses",
    "https://portal.cin.ufpe.br/pos-graduacao/especializacoes-2/residencia-2/",
    5,
    "Gratuito + Bolsa",
    "Residência do CIn/UFPE em parceria com a Stellantis. Formação para aprimorar habilidades em desenvolvimento de software com aprendizado direcionado por profissionais experientes. Gratuito com bolsa de pesquisa.",
    ["Gratuito", "Bolsa", "Automotivo", "Stellantis", "Dev"]
  ),
  makeCourse(
    "ufrpe-mestrado",
    "UFRPE - Universidade Federal Rural de Pernambuco",
    "Mestrado em Informática Aplicada",
    "mestrado",
    "presencial",
    "flexivel",
    "Informática Aplicada",
    "Recife",
    "PE",
    "24 meses",
    "http://www.ppgia.ufrpe.br/",
    4,
    "Gratuito",
    "Mestrado acadêmico em Informática Aplicada na UFRPE. Linhas de pesquisa em engenharia de software, inteligência computacional e sistemas de informação. Possibilidade de bolsa CAPES/CNPq. Gratuito por ser universidade federal.",
    ["Gratuito", "Federal", "Bolsa", "Pesquisa", "CAPES"]
  ),
  makeCourse(
    "upe-mestrado",
    "Universidade de Pernambuco (UPE)",
    "Mestrado em Engenharia da Computação",
    "mestrado",
    "presencial",
    "flexivel",
    "Engenharia da Computação",
    "Recife",
    "PE",
    "24 meses",
    "http://www.ppgec.ecomp.poli.br/",
    4,
    "Gratuito",
    "Mestrado acadêmico em Engenharia da Computação na UPE/Poli. Linhas de pesquisa em engenharia de software, computação inteligente e sistemas distribuídos. Possibilidade de bolsa. Gratuito por ser universidade estadual pública.",
    ["Gratuito", "Estadual", "Bolsa", "Pesquisa", "CAPES"]
  ),
  makeCourse(
    "ifpe-pos-ti",
    "IFPE - Instituto Federal de Pernambuco",
    "Especialização em Tecnologia da Informação",
    "pos-graduacao",
    "presencial",
    "noturno",
    "Tecnologia da Informação",
    "Recife",
    "PE",
    "18 meses",
    "https://portal.ifpe.edu.br/o-ifpe/pesquisa-pos-graduacao-e-inovacao/pos-graduacao/",
    4,
    "Gratuito",
    "Pós-graduação lato sensu gratuita no IFPE campus Recife. Formação especializada em TI com foco em demandas do mercado local e regional. Gratuito por ser instituto federal público.",
    ["Gratuito", "Federal", "Instituto Federal", "TI"]
  ),
];

export type CourseSearchFilters = {
  query: string;
  modality: "all" | "presencial" | "ead" | "hibrido";
  level: "all" | "pos-graduacao" | "mestrado" | "doutorado";
};

export function searchCourses(filters: CourseSearchFilters): Course[] {
  let results = [...CURATED_COURSES];

  if (filters.modality !== "all") {
    results = results.filter((c) => c.modality === filters.modality);
  }

  if (filters.level !== "all") {
    results = results.filter((c) => c.level === filters.level);
  }

  if (filters.query.trim()) {
    const terms = filters.query.toLowerCase().split(/\s+/);
    results = results.filter((course) => {
      const searchable = [
        course.institution,
        course.program,
        course.area,
        course.city,
        course.description,
        ...course.tags,
      ]
        .join(" ")
        .toLowerCase();

      return terms.every((term) => searchable.includes(term));
    });
  }

  results.sort((a, b) => {
    const isRecifeA = a.city.toLowerCase() === "recife" ? 1 : 0;
    const isRecifeB = b.city.toLowerCase() === "recife" ? 1 : 0;
    if (isRecifeB !== isRecifeA) return isRecifeB - isRecifeA;

    const gradeA = a.mecGrade ?? 0;
    const gradeB = b.mecGrade ?? 0;
    if (gradeB !== gradeA) return gradeB - gradeA;

    return a.institution.localeCompare(b.institution);
  });

  return results;
}

export function getAllCourses(): Course[] {
  return CURATED_COURSES;
}

export function getCourseStats() {
  const total = CURATED_COURSES.length;
  const presencial = CURATED_COURSES.filter((c) => c.modality === "presencial").length;
  const ead = CURATED_COURSES.filter((c) => c.modality === "ead").length;
  const mestrado = CURATED_COURSES.filter((c) => c.level === "mestrado").length;
  const posGraduacao = CURATED_COURSES.filter((c) => c.level === "pos-graduacao").length;
  const doutorado = CURATED_COURSES.filter((c) => c.level === "doutorado").length;
  const recife = CURATED_COURSES.filter((c) => c.city.toLowerCase() === "recife").length;
  const comBolsa = CURATED_COURSES.filter((c) => c.price?.includes("Bolsa")).length;

  return { total, presencial, ead, mestrado, posGraduacao, doutorado, recife, comBolsa };
}
