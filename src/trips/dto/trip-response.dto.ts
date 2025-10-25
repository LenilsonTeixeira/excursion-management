import { ApiProperty } from '@nestjs/swagger';

export class TripImageResponseDto {
  @ApiProperty({ description: 'ID da imagem' })
  id: string;

  @ApiProperty({ description: 'URL da imagem original' })
  imageUrl: string;

  @ApiProperty({ description: 'URL do thumbnail' })
  thumbnailUrl: string;

  @ApiProperty({ description: 'É a imagem principal?' })
  isMain: boolean;

  @ApiProperty({ description: 'Ordem de exibição' })
  displayOrder: number;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}

export class TripGeneralInfoItemResponseDto {
  @ApiProperty({ description: 'ID do item' })
  id: string;

  @ApiProperty({ description: 'Título' })
  title: string;

  @ApiProperty({ description: 'Descrição' })
  description: string;

  @ApiProperty({ description: 'Ordem de exibição' })
  displayOrder: number;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}

export class TripItemResponseDto {
  @ApiProperty({ description: 'ID do item' })
  id: string;

  @ApiProperty({ description: 'Nome do item' })
  name: string;

  @ApiProperty({ description: 'Item está incluído?' })
  isIncluded: boolean;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}

export class AgeRangeNestedDto {
  @ApiProperty({ description: 'ID da faixa etária' })
  id: string;

  @ApiProperty({ description: 'Nome da faixa etária' })
  name: string;

  @ApiProperty({ description: 'Idade mínima' })
  minAge: number;

  @ApiProperty({ description: 'Idade máxima' })
  maxAge: number;

  @ApiProperty({ description: 'Ocupa assento' })
  occupiesSeat: boolean;
}

export class TripAgePriceGroupResponseDto {
  @ApiProperty({ description: 'ID do grupo de preço' })
  id: string;

  @ApiProperty({ description: 'ID da faixa etária' })
  ageRangeId: string;

  @ApiProperty({ description: 'Preço final de venda' })
  finalPrice: string;

  @ApiProperty({ description: 'Preço original (opcional)', required: false })
  originalPrice?: string;

  @ApiProperty({ description: 'Ordem de exibição' })
  displayOrder: number;

  @ApiProperty({ description: 'Descrição adicional', required: false })
  description?: string;

  @ApiProperty({ description: 'Grupo de preço está ativo' })
  isActive: boolean;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Dados da faixa etária',
    type: AgeRangeNestedDto,
    required: false,
  })
  ageRange?: AgeRangeNestedDto;
}

export class AgencyNestedDto {
  @ApiProperty({ description: 'ID da agência' })
  id: string;

  @ApiProperty({ description: 'Nome da agência' })
  name: string;

  @ApiProperty({ description: 'CADASTUR' })
  cadastur: string;

  @ApiProperty({ description: 'CNPJ' })
  cnpj: string;

  @ApiProperty({ description: 'Descrição', required: false })
  description?: string;
}

export class CategoryNestedDto {
  @ApiProperty({ description: 'ID da categoria' })
  id: string;

  @ApiProperty({ description: 'Nome da categoria' })
  name: string;
}

export class TripResponseDto {
  @ApiProperty({ description: 'ID da viagem' })
  id: string;

  @ApiProperty({ description: 'Slug da viagem' })
  slug: string;

  @ApiProperty({ description: 'Destino' })
  destination: string;

  @ApiProperty({ description: 'URL da imagem principal', required: false })
  mainImageUrl?: string;

  @ApiProperty({
    description: 'URL do thumbnail da imagem principal',
    required: false,
  })
  mainImageThumbnailUrl?: string;

  @ApiProperty({ description: 'URL do vídeo', required: false })
  videoUrl?: string;

  @ApiProperty({ description: 'Descrição', required: false })
  description?: string;

  @ApiProperty({ description: 'Data de partida' })
  departureDate: Date;

  @ApiProperty({ description: 'Data de retorno' })
  returnDate: Date;

  @ApiProperty({ description: 'Preço exibido', required: false })
  displayPrice?: string;

  @ApiProperty({ description: 'Label do preço', required: false })
  displayLabel?: string;

  @ApiProperty({ description: 'Total de vagas' })
  totalSeats: number;

  @ApiProperty({ description: 'Vagas reservadas' })
  reservedSeats: number;

  @ApiProperty({ description: 'Vagas disponíveis (computed)' })
  availableSeats: number;

  @ApiProperty({ description: 'Alerta de poucas vagas', required: false })
  alertLowStockThreshold?: number;

  @ApiProperty({ description: 'Alerta de últimas vagas', required: false })
  alertLastSeatsThreshold?: number;

  @ApiProperty({ description: 'Link compartilhável', required: false })
  shareableLink?: string;

  @ApiProperty({ description: 'Status da viagem' })
  status: string;

  @ApiProperty({ description: 'Permite seleção de assento' })
  allowSeatSelection: boolean;

  @ApiProperty({ description: 'Aceita lista de espera' })
  acceptsWaitingList: boolean;

  @ApiProperty({
    description: 'ID da política de cancelamento',
    required: false,
  })
  cancellationPolicyId?: string;

  @ApiProperty({ description: 'ID da agência' })
  agencyId: string;

  @ApiProperty({ description: 'ID da categoria' })
  categoryId: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Imagens da viagem',
    type: [TripImageResponseDto],
    required: false,
  })
  images?: TripImageResponseDto[];

  @ApiProperty({
    description: 'Informações gerais',
    type: [TripGeneralInfoItemResponseDto],
    required: false,
  })
  generalInfoItems?: TripGeneralInfoItemResponseDto[];

  @ApiProperty({
    description: 'Itens da viagem',
    type: [TripItemResponseDto],
    required: false,
  })
  items?: TripItemResponseDto[];

  @ApiProperty({
    description: 'Grupos de preço por faixa etária',
    type: [TripAgePriceGroupResponseDto],
    required: false,
  })
  agePriceGroups?: TripAgePriceGroupResponseDto[];

  @ApiProperty({
    description: 'Dados completos da agência',
    type: AgencyNestedDto,
    required: false,
  })
  agency?: AgencyNestedDto;

  @ApiProperty({
    description: 'Dados completos da categoria',
    type: CategoryNestedDto,
    required: false,
  })
  category?: CategoryNestedDto;
}
