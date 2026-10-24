export type DNSRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'PTR';

export interface DNSResolver {
  id: string;
  name: string;
  tagline: string;
  provider: string;
  primaryIPv4: string;
  secondaryIPv4: string;
  primaryIPv6?: string;
  secondaryIPv6?: string;
  dohEndpoint: string;
  dohMethod: 'GET' | 'POST';
  location: string;
  features: {
    dnssec: boolean;
    malwareBlocking: boolean;
    adBlocking: boolean;
    noLogging: boolean;
    anycast: boolean;
  };
  category?: 'Global Anycast' | 'Security & Privacy' | 'Ad Blocking' | 'Regional & Sovereign' | 'Telecom & Enterprise' | 'Custom';
  region?: string;
  color: string;
  isCustom?: boolean;
  createdAt?: number;
  notes?: string;
}

export interface DomainTestTarget {
  domain: string;
  category: 'Popular' | 'Tech' | 'Cloud' | 'Social' | 'Media' | 'Uncached';
  isUncachedProbe?: boolean;
}

export interface QuerySample {
  domain: string;
  latencyMs: number;
  success: boolean;
  timestamp: number;
  statusCode?: number;
  error?: string;
}

export interface ResolverBenchmarkResult {
  resolverId: string;
  resolver: DNSResolver;
  samples: QuerySample[];
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  jitterMs: number;
  cachedAvgMs: number;
  uncachedAvgMs: number;
  successRate: number; // 0 - 100
  dnssecSupported: boolean;
  status: 'pending' | 'testing' | 'completed' | 'failed';
  currentRank?: number;
}

export interface BenchmarkConfig {
  testRounds: number; // e.g. 3 runs per domain
  concurrency: number; // e.g. 4 parallel queries
  domains: DomainTestTarget[];
  timeoutMs: number; // e.g. 3000ms
  testDnssec: boolean;
  testUncached: boolean;
}

export interface LiveProbeResult {
  resolver: DNSResolver;
  domain: string;
  recordType: DNSRecordType;
  latencyMs: number;
  status: 'success' | 'error';
  records: Array<{
    name: string;
    type: number;
    typeName: string;
    TTL: number;
    data: string;
  }>;
  rawJson?: any;
  error?: string;
}

export interface BenchmarkSessionHistory {
  id: string;
  timestamp: number;
  dateFormatted: string;
  mode: 'quick' | 'standard' | 'deep';
  resolversCount: number;
  fastestResolverName: string;
  fastestResolverIp: string;
  fastestLatencyMs: number;
  medianLatencyMs: number;
  lowestJitterMs: number;
  lowestJitterResolverName: string;
  avgSuccessRate: number;
  results: ResolverBenchmarkResult[];
  notes?: string;
}

