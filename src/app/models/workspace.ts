// Espejo de WorkspaceDto (Backend/src/modules/workspaces/workspaces.types.ts).
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrearWorkspaceInput {
  name: string;
}

// Espejo de WorkspaceRole (Backend/prisma/schema.prisma).
export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';

// Espejo de WorkspaceMemberDto.
export interface WorkspaceMember {
  userId: string;
  email: string;
  displayName: string;
  role: WorkspaceRole;
  createdAt: string;
}

// Rol asignable por invitación o cambio de rol — el OWNER nunca se asigna
// por esas vías, solo mediante transferencia de propiedad (ver
// workspaces.service.ts en el Backend).
export type WorkspaceRoleAsignable = Exclude<WorkspaceRole, 'OWNER'>;

// Espejo de InvitationStatus (Backend/prisma/schema.prisma).
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

// Espejo de InvitationDto.
export interface Invitation {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  status: InvitationStatus;
  invitedById: string;
  expiresAt: string;
  createdAt: string;
}

export interface CrearInvitacionInput {
  email: string;
  role: WorkspaceRoleAsignable;
}

// Espejo de MyInvitationDto — invitación pendiente dirigida a mi correo,
// vista desde "invitaciones para mí" (no depende de que el correo de
// invitación haya llegado, ver docs/01-arquitectura.md).
export interface MiInvitacion extends Invitation {
  workspaceName: string;
}

export interface AceptarInvitacionResultado {
  workspace: Workspace;
  alreadyMember: boolean;
}
