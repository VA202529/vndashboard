export interface Lead {
  ID: string;
  Bedrijfsnaam?: string;
  Contactpersoon?: string;
  Email?: string;
  Telefoonnummer?: string;
  Website?: string;
  ProductInteresse?: string;
  PortfolioVoorbeeld?: string;
  Status?: string;
  TypeMail?: string;
  LaatstGecontacteerd?: string;
  VolgendeActieDatum?: string;
  Notities?: string;
  AangemaaktOp?: string;
  [k: string]: any;
}

export interface Client {
  ID: string;
  Klantnaam?: string;
  Bedrijfsnaam?: string;
  Contactpersoon?: string;
  Email?: string;
  Telefoonnummer?: string;
  ProjectType?: string;
  ProjectBeschrijving?: string;
  GedaanWerk?: string;
  WebsiteOfSysteemKostenTotaal?: number | string;
  BetaaldBedrag?: number | string;
  NogTeBetalen?: number | string;
  OnderhoudPerMaand?: number | string;
  OnderhoudBetaaldTot?: string;
  TikkieLinkDezeMaand?: string;
  BetaalStatus?: string;
  LaatsteUpdateMail?: string;
  Notities?: string;
  AangemaaktOp?: string;
  [k: string]: any;
}

export interface Message {
  ID?: string;
  Naam?: string;
  Email?: string;
  Telefoon?: string;
  Onderwerp?: string;
  Bericht?: string;
  Status?: string;
  Datum?: string;
  [k: string]: any;
}

export interface Quote {
  ID?: string;
  Naam?: string;
  Bedrijfsnaam?: string;
  Email?: string;
  Telefoon?: string;
  GewensteDienst?: string;
  Budget?: string;
  Projectbeschrijving?: string;
  Status?: string;
  Datum?: string;
  [k: string]: any;
}

export interface ProductRequest {
  ID?: string;
  Product?: string;
  Naam?: string;
  Email?: string;
  Telefoon?: string;
  Bedrijfsnaam?: string;
  ExtraInformatie?: string;
  Status?: string;
  Datum?: string;
  [k: string]: any;
}

export interface Product {
  ID?: string;
  titel?: string;
  slug?: string;
  beschrijving?: string;
  categorie?: string;
  prijs_vanaf?: number | string;
  onderhoud_eenmalig?: number | string;
  onderhoud_per_maand?: number | string;
  onderhoud_uitleg?: string;
  zichtbaar?: boolean | string;
  volgorde?: number | string;
  driveFolderId?: string;
  mapNaam?: string;
  [k: string]: any;
}

export interface PortfolioItem {
  ID?: string;
  titel?: string;
  slug?: string;
  beschrijving?: string;
  klantnaam?: string;
  categorie?: string;
  zichtbaar?: boolean | string;
  volgorde?: number | string;
  [k: string]: any;
}

export interface CompanyInfo {
  bedrijfsnaam?: string;
  slogan?: string;
  beschrijving?: string;
  adres?: string;
  telefoonnummer?: string;
  email_1?: string;
  email_2?: string;
  email_3?: string;
  openingstijd_1?: string;
  openingstijd_2?: string;
  openingstijd_3?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  website?: string;
  actief?: boolean | string;
  [k: string]: any;
}

export interface Subscriber {
  ID?: string;
  Email?: string;
  Status?: string;
  Datum?: string;
  [k: string]: any;
}

export interface DashboardResponse {
  ok?: boolean;
  leads?: Lead[];
  klanten?: Client[];
  berichten?: Message[];
  offertes?: Quote[];
  productAanvragen?: ProductRequest[];
  producten?: Product[];
  portfolio?: PortfolioItem[];
  bedrijfsgegevens?: CompanyInfo;
  nieuwsbrief?: Subscriber[];
  stats?: Record<string, number>;
  [k: string]: any;
}
