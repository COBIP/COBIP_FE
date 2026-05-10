import type {
  AdminGrammarMediaResponse,
  AdminGrammarMediaType,
  AdminGrammarTemplatePayload,
  AdminGrammarTemplateResponse,
  AdminGrammarTemplateStatus,
} from '@/types/AdminGrammarTemplateTypes';
import { API_BASE_URL } from '@/api/services/ApiConfig';

const ADMIN_GRAMMAR_TEMPLATE_API_URL = `${API_BASE_URL}/api/v1/admin/grammar-templates`;

async function parseResponseJson<TResponse>(response: Response): Promise<TResponse> {
  const contentType = response.headers.get('content-type') ?? '';
  const hasJsonBody = contentType.includes('application/json');
  const responseBody = hasJsonBody ? await response.json() : null;

  if (!response.ok) {
    const message =
      responseBody && typeof responseBody === 'object' && 'message' in responseBody
        ? String(responseBody.message)
        : `요청에 실패했습니다. (${response.status})`;

    throw new Error(message);
  }

  return responseBody as TResponse;
}

export async function createAdminGrammarTemplate(
  payload: AdminGrammarTemplatePayload,
): Promise<AdminGrammarTemplateResponse> {
  const response = await fetch(ADMIN_GRAMMAR_TEMPLATE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponseJson<AdminGrammarTemplateResponse>(response);
}

export async function updateAdminGrammarTemplate(
  templateId: string,
  payload: AdminGrammarTemplatePayload,
): Promise<AdminGrammarTemplateResponse> {
  const response = await fetch(`${ADMIN_GRAMMAR_TEMPLATE_API_URL}/${templateId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponseJson<AdminGrammarTemplateResponse>(response);
}

export async function updateAdminGrammarTemplateStatus(
  templateId: string,
  status: AdminGrammarTemplateStatus,
): Promise<AdminGrammarTemplateResponse> {
  const response = await fetch(`${ADMIN_GRAMMAR_TEMPLATE_API_URL}/${templateId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  return parseResponseJson<AdminGrammarTemplateResponse>(response);
}

export async function createAdminGrammarTemplateMedia(
  templateId: string,
  file: File,
  mediaType: AdminGrammarMediaType,
): Promise<AdminGrammarMediaResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${ADMIN_GRAMMAR_TEMPLATE_API_URL}/${templateId}/media?type=${mediaType}`,
    {
      method: 'POST',
      body: formData,
    },
  );

  return parseResponseJson<AdminGrammarMediaResponse>(response);
}
