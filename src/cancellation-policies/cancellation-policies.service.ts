import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  CancellationPoliciesRepository,
  CancellationPolicy,
} from './cancellation-policies.repository';
import { CreateCancellationPolicyDto } from './dto/create-cancellation-policy.dto';
import { UpdateCancellationPolicyDto } from './dto/update-cancellation-policy.dto';

@Injectable()
export class CancellationPoliciesService {
  constructor(
    private readonly cancellationPoliciesRepository: CancellationPoliciesRepository,
  ) {}

  async create(
    agencyId: string,
    createCancellationPolicyDto: CreateCancellationPolicyDto,
  ): Promise<CancellationPolicy> {
    // Validar regras
    this.validateRules(createCancellationPolicyDto.rules);

    // Verificar se nome já existe na agência
    const existingPolicy =
      await this.cancellationPoliciesRepository.findByNameAndAgency(
        createCancellationPolicyDto.name,
        agencyId,
      );
    if (existingPolicy) {
      throw new ConflictException(
        'Nome da política de cancelamento já está em uso nesta agência',
      );
    }

    const policy = await this.cancellationPoliciesRepository.create(
      agencyId,
      createCancellationPolicyDto,
    );

    // Se está marcando como padrão, definir como padrão após criar
    if (createCancellationPolicyDto.isDefault) {
      await this.cancellationPoliciesRepository.setDefaultPolicy(
        agencyId,
        policy.id,
      );
    }

    return policy;
  }

  async findAllByAgency(agencyId: string): Promise<CancellationPolicy[]> {
    return this.cancellationPoliciesRepository.findAllByAgency(agencyId);
  }

  async findOne(id: string): Promise<CancellationPolicy> {
    const policy = await this.cancellationPoliciesRepository.findOne(id);
    if (!policy) {
      throw new NotFoundException('Política de cancelamento não encontrada');
    }
    return policy;
  }

  async findOneByAgency(
    id: string,
    agencyId: string,
  ): Promise<CancellationPolicy> {
    const policy = await this.cancellationPoliciesRepository.findOneByAgency(
      id,
      agencyId,
    );
    if (!policy) {
      throw new NotFoundException(
        'Política de cancelamento não encontrada nesta agência',
      );
    }
    return policy;
  }

  async findDefaultByAgency(
    agencyId: string,
  ): Promise<CancellationPolicy | null> {
    return this.cancellationPoliciesRepository.findDefaultByAgency(agencyId);
  }

  async update(
    id: string,
    updateCancellationPolicyDto: UpdateCancellationPolicyDto,
  ): Promise<CancellationPolicy> {
    // Verificar se política existe
    const existingPolicy =
      await this.cancellationPoliciesRepository.findOne(id);
    if (!existingPolicy) {
      throw new NotFoundException('Política de cancelamento não encontrada');
    }

    // Validar regras se estão sendo atualizadas
    if (updateCancellationPolicyDto.rules) {
      this.validateRules(updateCancellationPolicyDto.rules);
    }

    // Verificar se nome já existe na agência (se está sendo atualizado)
    if (
      updateCancellationPolicyDto.name &&
      updateCancellationPolicyDto.name !== existingPolicy.name
    ) {
      const existingName =
        await this.cancellationPoliciesRepository.findByNameAndAgency(
          updateCancellationPolicyDto.name,
          existingPolicy.agencyId,
        );
      if (existingName) {
        throw new ConflictException(
          'Nome da política de cancelamento já está em uso nesta agência',
        );
      }
    }

    // Se está marcando como padrão, remover flag de outras políticas
    if (updateCancellationPolicyDto.isDefault) {
      await this.cancellationPoliciesRepository.setDefaultPolicy(
        existingPolicy.agencyId,
        id,
      );
    }

    const updatedPolicy = await this.cancellationPoliciesRepository.update(
      id,
      updateCancellationPolicyDto,
    );
    if (!updatedPolicy) {
      throw new NotFoundException('Política de cancelamento não encontrada');
    }

    return updatedPolicy;
  }

  async updateByAgency(
    id: string,
    agencyId: string,
    updateCancellationPolicyDto: UpdateCancellationPolicyDto,
  ): Promise<CancellationPolicy> {
    // Verificar se política existe na agência
    const existingPolicy =
      await this.cancellationPoliciesRepository.findOneByAgency(id, agencyId);
    if (!existingPolicy) {
      throw new NotFoundException(
        'Política de cancelamento não encontrada nesta agência',
      );
    }

    // Validar regras se estão sendo atualizadas
    if (updateCancellationPolicyDto.rules) {
      this.validateRules(updateCancellationPolicyDto.rules);
    }

    // Verificar se nome já existe na agência (se está sendo atualizado)
    if (
      updateCancellationPolicyDto.name &&
      updateCancellationPolicyDto.name !== existingPolicy.name
    ) {
      const existingName =
        await this.cancellationPoliciesRepository.findByNameAndAgency(
          updateCancellationPolicyDto.name,
          agencyId,
        );
      if (existingName) {
        throw new ConflictException(
          'Nome da política de cancelamento já está em uso nesta agência',
        );
      }
    }

    // Se está marcando como padrão, remover flag de outras políticas
    if (updateCancellationPolicyDto.isDefault) {
      await this.cancellationPoliciesRepository.setDefaultPolicy(agencyId, id);
    }

    const updatedPolicy =
      await this.cancellationPoliciesRepository.updateByAgency(
        id,
        agencyId,
        updateCancellationPolicyDto,
      );
    if (!updatedPolicy) {
      throw new NotFoundException(
        'Política de cancelamento não encontrada nesta agência',
      );
    }

    return updatedPolicy;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.cancellationPoliciesRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException('Política de cancelamento não encontrada');
    }
  }

  async removeByAgency(id: string, agencyId: string): Promise<void> {
    const deleted = await this.cancellationPoliciesRepository.removeByAgency(
      id,
      agencyId,
    );
    if (!deleted) {
      throw new NotFoundException(
        'Política de cancelamento não encontrada nesta agência',
      );
    }
  }

  async countByAgency(agencyId: string): Promise<number> {
    return this.cancellationPoliciesRepository.countByAgency(agencyId);
  }

  private validateRules(rules: any[]): void {
    if (!rules || rules.length === 0) {
      throw new BadRequestException('A política deve ter pelo menos uma regra');
    }

    // Verificar se há regras duplicadas por dias antes da viagem
    const daysSet = new Set();
    const displayOrderSet = new Set();

    for (const rule of rules) {
      if (daysSet.has(rule.daysBeforeTrip)) {
        throw new ConflictException(
          `Já existe uma regra para ${rule.daysBeforeTrip} dias antes da viagem`,
        );
      }
      daysSet.add(rule.daysBeforeTrip);

      if (displayOrderSet.has(rule.displayOrder)) {
        throw new ConflictException(
          `Já existe uma regra com ordem de exibição ${rule.displayOrder}`,
        );
      }
      displayOrderSet.add(rule.displayOrder);

      // Validar percentual de reembolso
      if (rule.refundPercentage < 0 || rule.refundPercentage > 1) {
        throw new BadRequestException(
          'O percentual de reembolso deve estar entre 0 e 1',
        );
      }

      // Validar dias antes da viagem
      if (rule.daysBeforeTrip < 0) {
        throw new BadRequestException(
          'Os dias antes da viagem devem ser maiores ou iguais a 0',
        );
      }
    }

    // Verificar se as regras estão ordenadas corretamente por dias (maior para menor)
    const sortedRules = [...rules].sort(
      (a, b) => b.daysBeforeTrip - a.daysBeforeTrip,
    );
    for (let i = 0; i < sortedRules.length - 1; i++) {
      if (
        sortedRules[i].refundPercentage < sortedRules[i + 1].refundPercentage
      ) {
        throw new BadRequestException(
          'As regras devem ter percentuais de reembolso decrescentes conforme os dias diminuem',
        );
      }
    }
  }
}
