import type {
  AiFeatureTemplateApiField,
  AiFeatureTemplateApiHeader,
  AiFeatureTemplateApiSpec,
  AiFeatureTemplateErrorResponse,
  AiFeatureTemplateStatusCode,
} from '@/api/services/AiService';

function formatValue(value: unknown) {
  if (value == null || value === '') return '-';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? '예' : '아니요';
  return JSON.stringify(value, null, 2);
}

function RequiredBadge({ required }: { required: boolean }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${
      required ? 'bg-[#FEE2E2] text-[#B91C1C]' : 'bg-[#F1F5F9] text-[#64748B]'
    }`}>
      {required ? '필수' : '선택'}
    </span>
  );
}

function TableCell({ children, mono = false }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <td className={`whitespace-pre-wrap border-b border-[#E2E8F0] px-4 py-3 align-top text-sm leading-6 text-[#475569] ${
      mono ? 'font-mono text-xs' : ''
    }`}>
      {children}
    </td>
  );
}

function TableSection<T>({
  title,
  items,
  columns,
  renderRow,
}: {
  title: string;
  items: T[];
  columns: string[];
  renderRow: (item: T, index: number) => React.ReactNode;
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <h4 className="mb-3 text-base font-bold text-[#1E293B]">{title}</h4>
      <div className="overflow-x-auto rounded-lg border border-[#E2E8F0] bg-white">
        <table className="w-full min-w-[48rem] border-collapse text-left">
          <thead className="bg-[#F8FAFC]">
            <tr>
              {columns.map((column) => (
                <th key={column} className="whitespace-nowrap border-b border-[#E2E8F0] px-4 py-3 text-xs font-semibold text-[#475569]">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{items.map(renderRow)}</tbody>
        </table>
      </div>
    </section>
  );
}

export function ApiSpecDetails({ api }: { api: AiFeatureTemplateApiSpec }) {
  const hasExtendedDetails = Boolean(
    api.authenticationRequired != null ||
    api.requestHeaders?.length ||
    api.requestFields?.length ||
    api.responseFields?.length ||
    api.statusCodes?.length ||
    api.errorResponses?.length ||
    api.frontendNotes?.length,
  );

  if (!hasExtendedDetails) return null;

  return (
    <div className="mt-5 space-y-6">
      <TableSection
        title="API 기본 정보"
        items={[api]}
        columns={['API 이름', 'Method', 'Endpoint', '인증 필요 여부']}
        renderRow={(item) => (
          <tr key={`${item.method}-${item.endpoint}`}>
            <TableCell>{item.apiName || '-'}</TableCell>
            <TableCell mono>{item.method || '-'}</TableCell>
            <TableCell mono>{item.endpoint || '-'}</TableCell>
            <TableCell>{item.authenticationRequired == null ? '-' : item.authenticationRequired ? '필요' : '불필요'}</TableCell>
          </tr>
        )}
      />
      <TableSection
        title="Request Headers"
        items={api.requestHeaders ?? []}
        columns={['Header', 'Required', 'Value', 'Description']}
        renderRow={(item: AiFeatureTemplateApiHeader, index) => (
          <tr key={`${item.header}-${index}`}>
            <TableCell mono>{item.header || '-'}</TableCell>
            <TableCell><RequiredBadge required={item.required} /></TableCell>
            <TableCell mono>{item.value || '-'}</TableCell>
            <TableCell>{item.description || '-'}</TableCell>
          </tr>
        )}
      />
      <TableSection
        title="Request Fields"
        items={api.requestFields ?? []}
        columns={['필드명', '타입', '필수 여부', '설명', '예시']}
        renderRow={(item: AiFeatureTemplateApiField, index) => <FieldRow key={`${item.fieldName}-${index}`} item={item} />}
      />
      <TableSection
        title="Response Fields"
        items={api.responseFields ?? []}
        columns={['필드명', '타입', '필수 여부', '설명', '예시']}
        renderRow={(item: AiFeatureTemplateApiField, index) => <FieldRow key={`${item.fieldName}-${index}`} item={item} />}
      />
      <TableSection
        title="Status Codes"
        items={api.statusCodes ?? []}
        columns={['코드', '설명', '발생 조건']}
        renderRow={(item: AiFeatureTemplateStatusCode, index) => (
          <tr key={`${item.code}-${index}`}>
            <TableCell mono>{formatValue(item.code)}</TableCell>
            <TableCell>{item.description || '-'}</TableCell>
            <TableCell>{item.condition || '-'}</TableCell>
          </tr>
        )}
      />
      <TableSection
        title="Error Responses"
        items={api.errorResponses ?? []}
        columns={['상태 코드', '에러 코드', '메시지', '예시']}
        renderRow={(item: AiFeatureTemplateErrorResponse, index) => (
          <tr key={`${item.statusCode}-${item.errorCode}-${index}`}>
            <TableCell mono>{formatValue(item.statusCode)}</TableCell>
            <TableCell mono>{item.errorCode || '-'}</TableCell>
            <TableCell>{item.message || '-'}</TableCell>
            <TableCell mono>{formatValue(item.example)}</TableCell>
          </tr>
        )}
      />

      {(api.frontendNotes?.length ?? 0) > 0 && (
        <section className="rounded-lg border border-[#DDD6FE] bg-[#F5F3FF] p-4">
          <h4 className="text-base font-bold text-[#5B21B6]">Frontend Notes</h4>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[#475569]">
            {api.frontendNotes?.map((note, index) => (
              <li key={`${note}-${index}`} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7C3AED]" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function FieldRow({ item }: { item: AiFeatureTemplateApiField }) {
  return (
    <tr>
      <TableCell mono>{item.fieldName || '-'}</TableCell>
      <TableCell mono>{item.type || '-'}</TableCell>
      <TableCell><RequiredBadge required={item.required} /></TableCell>
      <TableCell>{item.description || '-'}</TableCell>
      <TableCell mono>{formatValue(item.example)}</TableCell>
    </tr>
  );
}
