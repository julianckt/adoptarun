import { useCallback, useEffect, useState } from 'react';
import { useClient, useCurrentUser, type Tool } from 'sanity';
import { RocketIcon } from '@sanity/icons/Rocket';
import { Button, Card, Container, Flex, Stack, Text } from '@sanity/ui';
import { cooldownRemainingMs, formatCooldown } from '../utils/deploy-cooldown';

interface LastRequest {
  requestedAt?: string;
  requestedBy?: string;
}

const LAST_REQUEST_QUERY = `*[_type == "deployRequest"] | order(requestedAt desc)[0]{ requestedAt, requestedBy }`;

export function DeployTool() {
  const client = useClient({ apiVersion: '2026-03-01' });
  const user = useCurrentUser();
  const [last, setLast] = useState<LastRequest | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    client
      .fetch<LastRequest | null>(LAST_REQUEST_QUERY, {}, { perspective: 'raw', useCdn: false })
      .then((doc) => !cancelled && setLast(doc))
      .catch(() => !cancelled && setError('Could not check the last deploy request.'));
    return () => {
      cancelled = true;
    };
  }, [client]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = cooldownRemainingMs(last?.requestedAt, now);
  const disabled = busy || remaining > 0;

  const requestDeploy = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const doc = {
        _type: 'deployRequest',
        requestedAt: new Date().toISOString(),
        requestedBy: user?.name || user?.email || 'Unknown',
      };
      await client.create(doc);
      setLast(doc);
      setNow(Date.now());
    } catch {
      setError('Deploy request failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [client, user]);

  return (
    <Flex justify="center" padding={5}>
      <Container width={1}>
        <Card padding={4} radius={3} border>
          <Stack gap={4}>
            <Text size={3} weight="semibold">
              Publish changes to the live site
            </Text>
            <Text muted>
              Publishing in Studio saves your edits but does not update adoptarun.org. When you are
              done editing, press the button below once. The site rebuilds from the latest published
              content and goes live in a few minutes.
            </Text>
            <Button
              icon={RocketIcon}
              tone="positive"
              padding={4}
              loading={busy}
              disabled={disabled}
              onClick={requestDeploy}
              text={remaining > 0 ? `Deploy requested — wait ${formatCooldown(remaining)}` : 'Update live site'}
            />
            {last?.requestedAt && (
              <Text size={1} muted>
                Last requested by {last.requestedBy || 'Unknown'} on{' '}
                {new Date(last.requestedAt).toLocaleString()}
              </Text>
            )}
            {error && (
              <Card tone="critical" padding={3} radius={2} role="alert">
                <Text size={1}>{error}</Text>
              </Card>
            )}
          </Stack>
        </Card>
      </Container>
    </Flex>
  );
}

export const deployTool = (): Tool => ({
  name: 'deploy',
  title: 'Deploy',
  icon: RocketIcon,
  component: DeployTool,
});
