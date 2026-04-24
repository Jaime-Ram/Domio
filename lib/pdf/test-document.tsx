import { View, Text, StyleSheet } from '@react-pdf/renderer'
import { DomioDocument, Section, DataRow, C, t } from './shell'

const styles = StyleSheet.create({
  intro: {
    fontSize: 10,
    color: C.gray,
    marginBottom: 24,
    lineHeight: 1.5,
  },
  signatureRow: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 48,
  },
  sigBlock: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  sigName: {
    fontSize: 9,
    color: C.text,
    marginTop: 32,
    borderTopWidth: 1,
    borderTopColor: C.text,
    paddingTop: 4,
  },
})

export function TestDocument() {
  return (
    <DomioDocument docType="Huurovereenkomst" reference="DOM-TEST-001">
      {/* Title */}
      <View style={t.mb20}>
        <Text style={t.h1}>Huurovereenkomst</Text>
        <Text style={[t.small, { marginTop: 4, color: C.gray }]}>
          Datum: {new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Partijen */}
      <Section title="Partijen">
        <DataRow label="Verhuurder" value="Domio Vastgoed B.V." />
        <DataRow label="Adres verhuurder" value="Voorbeeldstraat 1, 1234 AB Amsterdam" alt />
        <DataRow label="Huurder" value="Jan de Vries" />
        <DataRow label="E-mail huurder" value="jan@example.nl" alt />
        <DataRow label="Telefoon huurder" value="+31 6 12345678" />
      </Section>

      {/* Het gehuurde */}
      <Section title="Het gehuurde">
        <DataRow label="Adres" value="Keizersgracht 123, 1015 CJ Amsterdam" />
        <DataRow label="Type" value="Appartement" alt />
        <DataRow label="Oppervlakte" value="72 m²" />
      </Section>

      {/* Huurcondities */}
      <Section title="Huurcondities">
        <DataRow label="Huurprijs per maand" value="€ 1.450,00" />
        <DataRow label="Waarborgsom" value="€ 1.450,00 (1× maandhuur)" alt />
        <DataRow label="Ingangsdatum" value="1 juni 2025" />
        <DataRow label="Contractvorm" value="Onbepaalde tijd" alt />
        <DataRow label="Facturatie" value="Maandelijks, dag 1" />
        <DataRow label="Indexatie" value="CBS-inflatie (jaarlijks per 1 juli)" alt />
        <DataRow label="Opzegtermijn huurder" value="1 maand" />
        <DataRow label="Opzegtermijn verhuurder" value="3 maanden" alt />
      </Section>

      {/* Artikel */}
      <Section title="Bepalingen">
        <View style={t.mb12}>
          <Text style={[t.h3, t.mb4]}>Artikel 1 — Bestemming</Text>
          <Text style={t.body}>
            Het gehuurde is uitsluitend bestemd om te worden gebruikt als woonruimte door de huurder.
            Gebruik voor andere doeleinden is slechts toegestaan na schriftelijke toestemming van de verhuurder.
          </Text>
        </View>
        <View style={t.mb12}>
          <Text style={[t.h3, t.mb4]}>Artikel 2 — Betaling</Text>
          <Text style={t.body}>
            De huurprijs is bij vooruitbetaling verschuldigd, uiterlijk op de eerste dag van elke kalendermaand.
            Betaling geschiedt door overmaking op het door de verhuurder opgegeven bankrekeningnummer.
          </Text>
        </View>
        <View style={t.mb12}>
          <Text style={[t.h3, t.mb4]}>Artikel 3 — Onderhoud</Text>
          <Text style={t.body}>
            Klein dagelijks onderhoud en kleine reparaties zijn voor rekening van de huurder.
            Groot onderhoud en structurele gebreken zijn voor rekening van de verhuurder, conform artikel 7:206 BW.
          </Text>
        </View>
        <View style={t.mb12}>
          <Text style={[t.h3, t.mb4]}>Artikel 4 — Toepasselijk recht</Text>
          <Text style={t.body}>
            Op deze overeenkomst is Nederlands recht van toepassing. Geschillen worden voorgelegd
            aan de bevoegde rechter in het arrondissement waar het gehuurde is gelegen.
          </Text>
        </View>
      </Section>

      {/* Handtekeningen */}
      <View style={styles.signatureRow}>
        <View style={styles.sigBlock}>
          <Text style={[t.label, t.mb8]}>Verhuurder</Text>
          <Text style={t.small}>Domio Vastgoed B.V.</Text>
          <Text style={styles.sigName}>Naam + handtekening</Text>
          <Text style={[t.small, { marginTop: 8 }]}>Datum: ____________________</Text>
        </View>
        <View style={styles.sigBlock}>
          <Text style={[t.label, t.mb8]}>Huurder</Text>
          <Text style={t.small}>Jan de Vries</Text>
          <Text style={styles.sigName}>Naam + handtekening</Text>
          <Text style={[t.small, { marginTop: 8 }]}>Datum: ____________________</Text>
        </View>
      </View>
    </DomioDocument>
  )
}
