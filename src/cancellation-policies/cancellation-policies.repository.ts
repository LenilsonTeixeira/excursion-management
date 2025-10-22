import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../db/database.module';
import { cancellationPolicies, cancellationPolicyRules } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { CreateCancellationPolicyDto } from './dto/create-cancellation-policy.dto';
import { UpdateCancellationPolicyDto } from './dto/update-cancellation-policy.dto';
import * as schema from '../db/schema';

export interface CancellationPolicyRule {
  id: string;
  policyId: string;
  daysBeforeTrip: number;
  refundPercentage: string; // decimal como string
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CancellationPolicy {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  agencyId: string;
  createdAt: Date;
  updatedAt: Date;
  rules?: CancellationPolicyRule[];
}

@Injectable()
export class CancellationPoliciesRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(
    agencyId: string,
    createCancellationPolicyDto: CreateCancellationPolicyDto,
  ): Promise<CancellationPolicy> {
    return this.db.transaction(async (tx) => {
      // Criar a política (sempre como não padrão inicialmente)
      const [policy] = await tx
        .insert(cancellationPolicies)
        .values({
          agencyId,
          name: createCancellationPolicyDto.name,
          description: createCancellationPolicyDto.description,
          isDefault: false, // Sempre criar como não padrão, será definido depois se necessário
          updatedAt: new Date(),
        })
        .returning();

      // Criar as regras
      const rules = await tx
        .insert(cancellationPolicyRules)
        .values(
          createCancellationPolicyDto.rules.map((rule) => ({
            policyId: policy.id,
            daysBeforeTrip: rule.daysBeforeTrip,
            refundPercentage: rule.refundPercentage.toString(),
            displayOrder: rule.displayOrder,
            updatedAt: new Date(),
          })),
        )
        .returning();

      return {
        ...policy,
        rules: rules.map((rule) => ({
          ...rule,
          refundPercentage: rule.refundPercentage,
        })),
      } as CancellationPolicy;
    });
  }

  async findAllByAgency(agencyId: string): Promise<CancellationPolicy[]> {
    const policies = await this.db
      .select()
      .from(cancellationPolicies)
      .where(eq(cancellationPolicies.agencyId, agencyId))
      .orderBy(
        desc(cancellationPolicies.isDefault),
        cancellationPolicies.createdAt,
      );

    const policiesWithRules = await Promise.all(
      policies.map(async (policy) => {
        const rules = await this.db
          .select()
          .from(cancellationPolicyRules)
          .where(eq(cancellationPolicyRules.policyId, policy.id))
          .orderBy(cancellationPolicyRules.displayOrder);

        return {
          ...policy,
          rules: rules.map((rule) => ({
            ...rule,
            refundPercentage: rule.refundPercentage,
          })),
        };
      }),
    );

    return policiesWithRules as CancellationPolicy[];
  }

  async findOne(id: string): Promise<CancellationPolicy | null> {
    const [policy] = await this.db
      .select()
      .from(cancellationPolicies)
      .where(eq(cancellationPolicies.id, id))
      .limit(1);

    if (!policy) {
      return null;
    }

    const rules = await this.db
      .select()
      .from(cancellationPolicyRules)
      .where(eq(cancellationPolicyRules.policyId, policy.id))
      .orderBy(cancellationPolicyRules.displayOrder);

    return {
      ...policy,
      rules: rules.map((rule) => ({
        ...rule,
        refundPercentage: rule.refundPercentage,
      })),
    } as CancellationPolicy;
  }

  async findOneByAgency(
    id: string,
    agencyId: string,
  ): Promise<CancellationPolicy | null> {
    const [policy] = await this.db
      .select()
      .from(cancellationPolicies)
      .where(
        and(
          eq(cancellationPolicies.id, id),
          eq(cancellationPolicies.agencyId, agencyId),
        ),
      )
      .limit(1);

    if (!policy) {
      return null;
    }

    const rules = await this.db
      .select()
      .from(cancellationPolicyRules)
      .where(eq(cancellationPolicyRules.policyId, policy.id))
      .orderBy(cancellationPolicyRules.displayOrder);

    return {
      ...policy,
      rules: rules.map((rule) => ({
        ...rule,
        refundPercentage: rule.refundPercentage,
      })),
    } as CancellationPolicy;
  }

  async findByNameAndAgency(
    name: string,
    agencyId: string,
  ): Promise<CancellationPolicy | null> {
    const [policy] = await this.db
      .select()
      .from(cancellationPolicies)
      .where(
        and(
          eq(cancellationPolicies.name, name),
          eq(cancellationPolicies.agencyId, agencyId),
        ),
      )
      .limit(1);

    return policy as CancellationPolicy | null;
  }

  async findDefaultByAgency(
    agencyId: string,
  ): Promise<CancellationPolicy | null> {
    const [policy] = await this.db
      .select()
      .from(cancellationPolicies)
      .where(
        and(
          eq(cancellationPolicies.agencyId, agencyId),
          eq(cancellationPolicies.isDefault, true),
        ),
      )
      .limit(1);

    if (!policy) {
      return null;
    }

    const rules = await this.db
      .select()
      .from(cancellationPolicyRules)
      .where(eq(cancellationPolicyRules.policyId, policy.id))
      .orderBy(cancellationPolicyRules.displayOrder);

    return {
      ...policy,
      rules: rules.map((rule) => ({
        ...rule,
        refundPercentage: rule.refundPercentage,
      })),
    } as CancellationPolicy;
  }

  async update(
    id: string,
    updateCancellationPolicyDto: UpdateCancellationPolicyDto,
  ): Promise<CancellationPolicy | null> {
    return this.db.transaction(async (tx) => {
      // Atualizar a política
      const [policy] = await tx
        .update(cancellationPolicies)
        .set({
          name: updateCancellationPolicyDto.name,
          description: updateCancellationPolicyDto.description,
          isDefault: updateCancellationPolicyDto.isDefault,
          updatedAt: new Date(),
        })
        .where(eq(cancellationPolicies.id, id))
        .returning();

      if (!policy) {
        return null;
      }

      // Se há regras para atualizar, deletar as existentes e criar as novas
      if (updateCancellationPolicyDto.rules) {
        await tx
          .delete(cancellationPolicyRules)
          .where(eq(cancellationPolicyRules.policyId, id));

        const rules = await tx
          .insert(cancellationPolicyRules)
          .values(
            updateCancellationPolicyDto.rules.map((rule) => ({
              policyId: id,
              daysBeforeTrip: rule.daysBeforeTrip,
              refundPercentage: rule.refundPercentage.toString(),
              displayOrder: rule.displayOrder,
              updatedAt: new Date(),
            })),
          )
          .returning();

        return {
          ...policy,
          rules: rules.map((rule) => ({
            ...rule,
            refundPercentage: rule.refundPercentage,
          })),
        } as CancellationPolicy;
      }

      // Buscar regras existentes
      const rules = await tx
        .select()
        .from(cancellationPolicyRules)
        .where(eq(cancellationPolicyRules.policyId, id))
        .orderBy(cancellationPolicyRules.displayOrder);

      return {
        ...policy,
        rules: rules.map((rule) => ({
          ...rule,
          refundPercentage: rule.refundPercentage,
        })),
      } as CancellationPolicy;
    });
  }

  async updateByAgency(
    id: string,
    agencyId: string,
    updateCancellationPolicyDto: UpdateCancellationPolicyDto,
  ): Promise<CancellationPolicy | null> {
    return this.db.transaction(async (tx) => {
      // Atualizar a política
      const [policy] = await tx
        .update(cancellationPolicies)
        .set({
          name: updateCancellationPolicyDto.name,
          description: updateCancellationPolicyDto.description,
          isDefault: updateCancellationPolicyDto.isDefault,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(cancellationPolicies.id, id),
            eq(cancellationPolicies.agencyId, agencyId),
          ),
        )
        .returning();

      if (!policy) {
        return null;
      }

      // Se há regras para atualizar, deletar as existentes e criar as novas
      if (updateCancellationPolicyDto.rules) {
        await tx
          .delete(cancellationPolicyRules)
          .where(eq(cancellationPolicyRules.policyId, id));

        const rules = await tx
          .insert(cancellationPolicyRules)
          .values(
            updateCancellationPolicyDto.rules.map((rule) => ({
              policyId: id,
              daysBeforeTrip: rule.daysBeforeTrip,
              refundPercentage: rule.refundPercentage.toString(),
              displayOrder: rule.displayOrder,
              updatedAt: new Date(),
            })),
          )
          .returning();

        return {
          ...policy,
          rules: rules.map((rule) => ({
            ...rule,
            refundPercentage: rule.refundPercentage,
          })),
        } as CancellationPolicy;
      }

      // Buscar regras existentes
      const rules = await tx
        .select()
        .from(cancellationPolicyRules)
        .where(eq(cancellationPolicyRules.policyId, id))
        .orderBy(cancellationPolicyRules.displayOrder);

      return {
        ...policy,
        rules: rules.map((rule) => ({
          ...rule,
          refundPercentage: rule.refundPercentage,
        })),
      } as CancellationPolicy;
    });
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db
      .delete(cancellationPolicies)
      .where(eq(cancellationPolicies.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async removeByAgency(id: string, agencyId: string): Promise<boolean> {
    const result = await this.db
      .delete(cancellationPolicies)
      .where(
        and(
          eq(cancellationPolicies.id, id),
          eq(cancellationPolicies.agencyId, agencyId),
        ),
      );
    return (result.rowCount ?? 0) > 0;
  }

  async countByAgency(agencyId: string): Promise<number> {
    const result = await this.db
      .select({ count: cancellationPolicies.id })
      .from(cancellationPolicies)
      .where(eq(cancellationPolicies.agencyId, agencyId));
    return result.length;
  }

  async setDefaultPolicy(agencyId: string, policyId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      // Remover flag de padrão de todas as políticas da agência
      await tx
        .update(cancellationPolicies)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(cancellationPolicies.agencyId, agencyId));

      // Definir a política especificada como padrão
      await tx
        .update(cancellationPolicies)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(
          and(
            eq(cancellationPolicies.id, policyId),
            eq(cancellationPolicies.agencyId, agencyId),
          ),
        );
    });
  }
}
