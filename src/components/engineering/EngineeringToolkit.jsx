import { useState, useEffect, useMemo, useRef } from "react";
import {
  isValidInBase,
  toAllBases,
  gates,
  shaHash,
  ipToInt,
  calcSubnet,
  allocateVLSM,
} from "../../utils/engineeringMath";

function EngPanel({ children }) {
  return <div className="eng-panel">{children}</div>;
}

function EngLabel({ children }) {
  return <div className="eng-label">{children}</div>;
}

function EngMono({ children, className = "" }) {
  return <div className={`eng-mono ${className}`.trim()}>{children}</div>;
}

function EngInput({ value, onChange, placeholder, invalid }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`eng-input${invalid ? " eng-input-invalid" : ""}`}
    />
  );
}

function EngSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="eng-select">
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function BaseConverter() {
  const [active, setActive] = useState(10);
  const [raw, setRaw] = useState("42");
  const valid = isValidInBase(raw, active);
  const all = useMemo(() => (valid ? toAllBases(raw, active) : null), [raw, active, valid]);
  const rows = [
    { base: 2, label: "BIN" },
    { base: 8, label: "OCT" },
    { base: 10, label: "DEC" },
    { base: 16, label: "HEX" },
  ];

  return (
    <div className="eng-tool">
      <EngLabel>Type a value in any base — the rest sync live</EngLabel>
      {rows.map((r) => (
        <div key={r.base} className="eng-row">
          <button
            type="button"
            onClick={() => setActive(r.base)}
            className={`eng-base-btn${active === r.base ? " active" : ""}`}
          >
            {r.label}
          </button>
          <EngInput
            value={active === r.base ? raw : all ? all[r.base] : ""}
            onChange={(v) => {
              setActive(r.base);
              setRaw(v);
            }}
            invalid={active === r.base && !valid}
          />
        </div>
      ))}
      {!valid && <div className="eng-error">Invalid digit for base {active}</div>}
    </div>
  );
}

function BitwiseOps() {
  const [a, setA] = useState("12");
  const [b, setB] = useState("10");
  const [op, setOp] = useState("AND");
  const aNum = parseInt(a, 10) || 0;
  const bNum = parseInt(b, 10) || 0;
  const result = op === "NOT" ? (~aNum >>> 0) & 0xff : gates[op](aNum, bNum);

  return (
    <div className="eng-tool">
      <div className="eng-flex-row">
        <div className="eng-field">
          <EngLabel>A (decimal)</EngLabel>
          <EngInput value={a} onChange={setA} />
        </div>
        {op !== "NOT" && (
          <div className="eng-field">
            <EngLabel>B (decimal)</EngLabel>
            <EngInput value={b} onChange={setB} />
          </div>
        )}
        <div className="eng-field eng-field-narrow">
          <EngLabel>Operation</EngLabel>
          <EngSelect
            value={op}
            onChange={setOp}
            options={["AND", "OR", "XOR", "NOT", "NAND", "NOR", "XNOR"]}
          />
        </div>
      </div>
      <EngPanel>
        <EngLabel>Result</EngLabel>
        <EngMono className="eng-result-lg">{result}</EngMono>
        <div className="eng-sub">
          bin: {result.toString(2)} · hex: {result.toString(16).toUpperCase()}
        </div>
      </EngPanel>
    </div>
  );
}

function LogicGates() {
  const [gate, setGate] = useState("AND");
  const unary = gate === "NOT";
  const inputs = unary ? [0, 1] : [[0, 0], [0, 1], [1, 0], [1, 1]];

  return (
    <div className="eng-tool">
      <div className="eng-field">
        <EngLabel>Gate</EngLabel>
        <EngSelect value={gate} onChange={setGate} options={Object.keys(gates)} />
      </div>
      <EngPanel>
        <EngLabel>Truth table</EngLabel>
        <table className="eng-table">
          <thead>
            <tr>
              <th>A</th>
              {!unary && <th>B</th>}
              <th>OUT</th>
            </tr>
          </thead>
          <tbody>
            {unary
              ? inputs.map((val) => (
                  <tr key={val}>
                    <td>{val}</td>
                    <td className="eng-highlight">{gates.NOT(val)}</td>
                  </tr>
                ))
              : inputs.map(([a, b]) => (
                  <tr key={`${a}${b}`}>
                    <td>{a}</td>
                    <td>{b}</td>
                    <td className="eng-highlight">{gates[gate](a, b)}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </EngPanel>
    </div>
  );
}

function SubnetCalculator() {
  const [ip, setIp] = useState("192.168.1.10");
  const [cidr, setCidr] = useState("24");
  const ipInt = ipToInt(ip);
  const cidrNum = Number(cidr);
  const valid = ipInt !== null && cidrNum >= 0 && cidrNum <= 32;
  const result = useMemo(
    () => (valid ? calcSubnet(ipInt, cidrNum) : null),
    [ipInt, cidrNum, valid]
  );

  return (
    <div className="eng-tool">
      <div className="eng-flex-row">
        <div className="eng-field">
          <EngLabel>IP address</EngLabel>
          <EngInput value={ip} onChange={setIp} invalid={ipInt === null} />
        </div>
        <div className="eng-field eng-field-narrow">
          <EngLabel>CIDR /</EngLabel>
          <EngInput value={cidr} onChange={setCidr} />
        </div>
      </div>
      {result && (
        <>
          <EngPanel>
            <div className="eng-class-row">
              <div>
                <EngLabel>Network class</EngLabel>
                <EngMono className="eng-class-value">Class {result.classLabel}</EngMono>
              </div>
              <div className="eng-class-default">
                <EngLabel>Scope</EngLabel>
                <EngMono className="eng-scope">{result.scope}</EngMono>
              </div>
              {result.classDefaultCidr !== null && (
                <div className="eng-class-default">
                  <EngLabel>Default classful mask</EngLabel>
                  <EngMono className="eng-sub">/{result.classDefaultCidr}</EngMono>
                </div>
              )}
            </div>
          </EngPanel>
          <EngPanel>
            <div className="eng-grid">
              <div>
                <EngLabel>Subnet mask</EngLabel>
                <EngMono>{result.mask}</EngMono>
              </div>
              <div>
                <EngLabel>Wildcard mask</EngLabel>
                <EngMono>{result.wildcard}</EngMono>
              </div>
              <div>
                <EngLabel>Network address</EngLabel>
                <EngMono>{result.network}</EngMono>
              </div>
              <div>
                <EngLabel>Broadcast address</EngLabel>
                <EngMono>{result.broadcast}</EngMono>
              </div>
              <div>
                <EngLabel>Total addresses</EngLabel>
                <EngMono>{result.totalAddresses.toLocaleString()}</EngMono>
              </div>
              <div>
                <EngLabel>Usable hosts</EngLabel>
                <EngMono>{result.hostCount.toLocaleString()}</EngMono>
              </div>
              <div>
                <EngLabel>First host</EngLabel>
                <EngMono>{result.firstHost}</EngMono>
              </div>
              <div>
                <EngLabel>Last host</EngLabel>
                <EngMono>{result.lastHost}</EngMono>
              </div>
            </div>
          </EngPanel>
        </>
      )}
    </div>
  );
}

function HashGenerator() {
  const [text, setText] = useState("hello world");
  const [hashes, setHashes] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const algos = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
      const out = {};
      for (const algo of algos) {
        out[algo] = await shaHash(algo, text);
      }
      if (!cancelled) setHashes(out);
    })();
    return () => {
      cancelled = true;
    };
  }, [text]);

  return (
    <div className="eng-tool">
      <div className="eng-field">
        <EngLabel>Input text</EngLabel>
        <EngInput value={text} onChange={setText} />
      </div>
      <EngPanel>
        <div className="eng-hash-list">
          {Object.entries(hashes).map(([algo, val]) => (
            <div key={algo}>
              <EngLabel>{algo}</EngLabel>
              <EngMono className="eng-hash">{val}</EngMono>
            </div>
          ))}
        </div>
      </EngPanel>
    </div>
  );
}

function VLSMPlanner() {
  const [baseIp, setBaseIp] = useState("192.168.1.0");
  const [baseCidr, setBaseCidr] = useState("24");
  const [rows, setRows] = useState([
    { id: 1, name: "Sales", hosts: 50 },
    { id: 2, name: "IT", hosts: 20 },
    { id: 3, name: "Guest Wi-Fi", hosts: 10 },
  ]);
  const nextId = useRef(4);

  const baseIpInt = ipToInt(baseIp);
  const baseCidrNum = Number(baseCidr);
  const validBase = baseIpInt !== null && baseCidrNum >= 0 && baseCidrNum <= 32;

  const allocations = useMemo(() => {
    if (!validBase) return [];
    return allocateVLSM(
      baseIpInt,
      baseCidrNum,
      rows.filter((r) => r.hosts > 0)
    );
  }, [baseIpInt, baseCidrNum, rows, validBase]);

  const updateRow = (id, field, value) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, [field]: field === "hosts" ? Number(value) || 0 : value }
          : r
      )
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: nextId.current++, name: `Subnet ${prev.length + 1}`, hosts: 10 },
    ]);
  };

  const removeRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));

  return (
    <div className="eng-tool">
      <div className="eng-flex-row">
        <div className="eng-field">
          <EngLabel>Base network</EngLabel>
          <EngInput value={baseIp} onChange={setBaseIp} invalid={baseIpInt === null} />
        </div>
        <div className="eng-field eng-field-narrow">
          <EngLabel>CIDR /</EngLabel>
          <EngInput value={baseCidr} onChange={setBaseCidr} />
        </div>
      </div>

      <EngPanel>
        <EngLabel>Required subnets (largest allocated first)</EngLabel>
        <div className="eng-vlsm-rows">
          {rows.map((r) => (
            <div key={r.id} className="eng-vlsm-row">
              <EngInput
                value={r.name}
                onChange={(v) => updateRow(r.id, "name", v)}
                placeholder="Name"
              />
              <div className="eng-vlsm-hosts">
                <EngInput
                  value={String(r.hosts)}
                  onChange={(v) => updateRow(r.id, "hosts", v)}
                  placeholder="Hosts"
                />
              </div>
              <button
                type="button"
                className="eng-remove-btn"
                onClick={() => removeRow(r.id)}
                aria-label="Remove subnet"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="eng-add-btn" onClick={addRow}>
          + Add subnet
        </button>
      </EngPanel>

      {validBase && allocations.length > 0 && (
        <EngPanel>
          <EngLabel>Allocation</EngLabel>
          <div className="eng-table-wrap">
            <table className="eng-table eng-vlsm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Hosts</th>
                  <th>CIDR</th>
                  <th>Network</th>
                  <th>Range</th>
                  <th>Broadcast</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((a) => (
                  <tr key={a.id}>
                    <td>{a.name}</td>
                    {a.error ? (
                      <td colSpan={5} className="eng-error">
                        Not enough space left in {baseIp}/{baseCidr}
                      </td>
                    ) : (
                      <>
                        <td className="eng-muted">{a.hosts}</td>
                        <td className="eng-highlight">/{a.cidr}</td>
                        <td>{a.network}</td>
                        <td className="eng-scope">
                          {a.firstHost} – {a.lastHost}
                        </td>
                        <td>{a.broadcast}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </EngPanel>
      )}
    </div>
  );
}

const TOOLS = [
  { id: "base", label: "Base", num: "01", component: BaseConverter },
  { id: "bitwise", label: "Bitwise", num: "02", component: BitwiseOps },
  { id: "gates", label: "Gates", num: "03", component: LogicGates },
  { id: "subnet", label: "Subnet", num: "04", component: SubnetCalculator },
  { id: "hash", label: "Hash", num: "05", component: HashGenerator },
  { id: "vlsm", label: "VLSM", num: "06", component: VLSMPlanner },
];

export function EngineeringToolkit() {
  const [tab, setTab] = useState("base");
  const Active = TOOLS.find((t) => t.id === tab).component;

  return (
    <div className="engineering-toolkit">
      <div className="eng-header">
        <span className="eng-badge">CS / Engineering</span>
        <p className="eng-desc">Developer tools built into your calculator</p>
      </div>
      <div className="eng-tabs">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`eng-tab${tab === t.id ? " active" : ""}`}
          >
            <span className="eng-tab-num">{t.num}</span>
            {t.label}
          </button>
        ))}
      </div>
      <EngPanel>
        <Active />
      </EngPanel>
    </div>
  );
}
