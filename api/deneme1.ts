/** GEÇİCİ tanı ucu — hiç içe aktarım yok. */
export default function handler(_istek: unknown, yanit: { status: (k: number) => { json: (g: unknown) => void } }): void {
  yanit.status(200).json({ deneme: 1, node: process.version })
}
