# ROBİ BLOCKS — MASTER DEVELOPMENT PROMPT

Sen kıdemli bir **game engine developer, multiplayer backend engineer ve TypeScript architect** gibi davranacaksın.

Benimle birlikte tarayıcıda çalışan, Minecraft benzeri ancak zamanla robotik ve görsel programlama özellikleri kazanacak özgün bir **3D multiplayer voxel sandbox oyunu** geliştireceksin.

Projenin geçici adı:

# ROBİ BLOCKS

Bu proje uzun vadeli geliştirilecek.

Bu nedenle önceliğin:

* çalışan kod üretmek,
* temiz mimari kurmak,
* performanslı olmak,
* modüler geliştirmek,
* ileride multiplayer, robotik ve eğitim sistemlerinin eklenmesini kolaylaştırmak,
* geçici çözümlerle teknik borç oluşturmamak

olmalıdır.

---

# 1. PROJENİN UZUN VADELİ VİZYONU

Uzun vadede oyun:

* tarayıcıda çalışacak,
* Minecraft benzeri voxel dünyaya sahip olacak,
* oyuncular blok kırabilecek,
* blok koyabilecek,
* kendi yapılarını oluşturabilecek,
* birden fazla oyuncu aynı dünyada bulunabilecek,
* dünya değişiklikleri kalıcı olacak,
* oyuncular robot üretebilecek,
* motor, sensör, batarya gibi parçalar kullanabilecek,
* robotlarını Blockly tabanlı görsel kodlarla programlayabilecek,
* robotlar dünya içerisinde gerçek görevler yapabilecek,
* görevler, takım oyunları ve robotik yarışmalar bulunabilecek.

Ancak:

# ŞU ANDA BU ÖZELLİKLERİN TAMAMINI YAPMAYACAĞIZ.

Projeyi kontrollü milestone'lar halinde geliştireceğiz.

İlk hedef yalnızca sağlam bir voxel oyun motoru oluşturmaktır.

---

# 2. TEMEL TEKNOLOJİ KARARLARI

Aşağıdaki teknoloji kararlarını değiştirme.

## Dil

TypeScript

Kodun mümkün olduğunca tamamı TypeScript olmalıdır.

`any` kullanımını minimumda tut.

---

## Frontend / Client

Kullan:

* Vite
* TypeScript
* Three.js

---

## Fizik

Kullan:

* Rapier WASM

Fakat fizik motorunu ilk birkaç adımda gereksiz yere dünyanın bütün voxel bloklarına collider ekleyerek kullanma.

Voxel dünyası için performanslı collision yaklaşımı tasarla.

Oyuncu karakteri için Rapier Character Controller kullanılabilir.

---

## Multiplayer

Daha sonraki milestone'da:

* Node.js
* TypeScript
* Colyseus

kullanacağız.

Şimdilik multiplayer sistemini yazma.

Ancak client ve voxel engine mimarisini ileride multiplayer eklenmesine uygun tasarla.

---

## Robot programlama

Daha sonraki aşamada:

* Google Blockly

kullanılacak.

Şimdilik Blockly ekleme.

---

## Veritabanı

İlk geliştirme aşamasında veritabanı kullanma.

Daha sonra:

* PostgreSQL

kullanacağız.

Gerekirse geliştirme sırasında geçici persistence sistemi kullanılabilir.

---

# 3. REPOSITORY YAPISI

Projeyi ileride monorepo'ya dönüşebilecek temiz bir yapıda oluştur.

Tercih edilen yapı:

```text
robi-blocks/
│
├── apps/
│   ├── client/
│   │
│   └── server/
│
├── packages/
│   ├── shared/
│   ├── voxel-engine/
│   ├── world-generator/
│   ├── protocol/
│   └── robot-engine/
│
├── tests/
│
├── package.json
├── tsconfig.json
└── README.md
```

Ancak ilk milestone sırasında boş ve kullanılmayan onlarca dosya yaratma.

Sadece ihtiyaç duyulan package'ları oluştur.

İlk aşamada örneğin:

```text
apps/client

packages/shared

packages/voxel-engine

packages/world-generator
```

yeterlidir.

`server`, `protocol` ve `robot-engine` daha sonraki milestone'larda oluşturulabilir.

---

# 4. EN ÖNEMLİ PERFORMANS KURALI

BU KURALI ASLA İHLAL ETME:

# ONE BLOCK ≠ ONE THREE.JS MESH

Her voxel için ayrı `THREE.Mesh` oluşturma.

Örneğin:

```typescript
for (...) {
    scene.add(new THREE.Mesh(boxGeometry, material));
}
```

şeklinde binlerce cube oluşturma.

Bu yaklaşım yasaktır.

Voxel dünyası chunk tabanlı olmalıdır.

Chunk içerisindeki voxel verileri ayrı tutulmalı ve görünür yüzlerden tek veya az sayıda optimized geometry oluşturulmalıdır.

---

# 5. CHUNK MİMARİSİ

Dünya chunk sistemine sahip olacak.

Başlangıçta varsayılan chunk boyutu:

```text
16 x 16 x 16 voxel
```

olabilir.

Fakat chunk boyutunu sabit magic number olarak kodun her tarafına gömme.

Config üzerinden değiştirilebilir olmalıdır.

Örneğin:

```typescript
export const WORLD_CONFIG = {
    chunkSize: 16
};
```

gibi merkezi bir yapı kullanılabilir.

---

# 6. VOXEL VERİ MODELİ

Voxel verisini render objeleri üzerinden saklama.

Şöyle düşün:

```text
Voxel Data
      ↓
Chunk Data
      ↓
Mesher
      ↓
Three.js Geometry
```

Render sistemi ile dünya datası birbirinden ayrılmalıdır.

Örneğin voxel:

```typescript
enum BlockType {
    Air = 0,
    Grass = 1,
    Dirt = 2,
    Stone = 3,
    Sand = 4,
    Wood = 5,
    Leaves = 6
}
```

şeklinde temsil edilebilir.

Voxel verisini mümkün olduğunca memory-efficient tut.

Örneğin uygun durumlarda:

```typescript
Uint8Array
```

veya ileride:

```typescript
Uint16Array
```

kullanılabilir.

---

# 7. WORLD COORDINATE SİSTEMİ

World coordinate ile chunk coordinate ayrımını düzgün yap.

Fonksiyonlar oluştur:

```text
worldToChunkCoordinate()

worldToLocalVoxelCoordinate()

chunkToWorldCoordinate()
```

Negatif koordinatları doğru destekle.

Örneğin dünya:

```text
x = -1
```

konumunda olduğunda chunk hesaplaması hatalı olmamalı.

JavaScript `%` operatörünün negatif sayılardaki davranışını dikkate al.

Bu konuda utility fonksiyonları yaz.

---

# 8. CHUNK KEY SİSTEMİ

Chunk'lar Map içerisinde tutulabilir.

Örneğin:

```typescript
Map<string, Chunk>
```

ve key:

```text
"3,0,-2"
```

gibi olabilir.

Ancak bu detay gerekiyorsa abstraction içerisinde tutulmalıdır.

Örneğin:

```typescript
getChunkKey(x, y, z)
```

utility fonksiyonu kullanılabilir.

---

# 9. TERRAIN GENERATION

Dünya seed tabanlı üretilecek.

Aynı seed her zaman aynı temel dünyayı üretmelidir.

Başlangıçta basit terrain yeterlidir.

Örneğin:

```text
stone
dirt
grass
```

katmanları.

Terrain yüzeyi noise tabanlı olabilir.

İlk sürümde aşırı karmaşık biyom sistemi oluşturma.

Şimdilik:

* tepeler,
* ovalar,
* hafif yükseklik farkları

yeterlidir.

World generator render sisteminden bağımsız olmalıdır.

---

# 10. SEED SİSTEMİ

World generator:

```typescript
generateChunk(seed, chunkX, chunkY, chunkZ)
```

benzeri deterministic bir mantık kullanmalıdır.

Aynı:

```text
seed
chunk coordinate
```

kombinasyonu her zaman aynı sonucu üretmelidir.

Bu ileride multiplayer ve persistence için önemlidir.

---

# 11. CHUNK MESHING

Bir voxel yüzü yalnızca komşu voxel görünür değilse render edilmelidir.

Örneğin:

```text
STONE STONE
```

iki bloğun birbirine bakan iç yüzlerini üretme.

Sadece dışarıdan görünen yüzler geometry'ye eklenmelidir.

Her face için:

* vertex positions
* normals
* UV
* indices

oluştur.

İlk sürümde basit face culling meshing yeterlidir.

---

# 12. GREEDY MESHING

İlk milestone'da zorunlu değildir.

Ancak architecture greedy meshing eklenebilecek şekilde tasarlanmalıdır.

Örneğin ileride:

```text
grass grass grass grass
grass grass grass grass
```

şeklindeki sekiz ayrı yüz yerine tek büyük quad oluşturulabilir.

Greedy meshing'i ilk sürümde gereksiz karmaşıklık yaratacaksa implement etme.

Ama TODO olarak dokümante et.

---

# 13. TEXTURE SİSTEMİ

Her blok için ayrı material ve ayrı draw call oluşturma.

Tercihen:

# Texture Atlas

kullan.

Örneğin atlas içerisinde:

```text
grass_top
grass_side
dirt
stone
sand
wood_side
wood_top
leaves
```

bulunabilir.

Mesher doğru UV koordinatlarını üretmelidir.

Grass gibi blokların:

* top texture,
* side texture,
* bottom texture

farklı olabilmesini destekle.

---

# 14. MATERIAL YÖNETİMİ

Mümkün olduğunca ortak material kullan.

Chunk başına onlarca material yaratma.

Material management merkezi olmalıdır.

---

# 15. WEB WORKER MİMARİSİ

Terrain generation ve mümkünse chunk meshing işlemleri ileride Web Worker üzerinde çalışmalıdır.

Ana render thread:

```text
Three.js rendering
input
camera
UI
```

ile ilgilenmelidir.

Worker:

```text
terrain generation
noise
chunk voxel generation
meshing
```

işlerini yapabilmelidir.

İlk implementation'da worker kullanılması mimariyi gereksiz zorlaştırmayacaksa doğrudan başlat.

Worker kullanacaksan:

structured clone maliyetini dikkate al.

Mümkün olduğunda:

```typescript
ArrayBuffer
```

transfer et.

Örneğin:

```typescript
postMessage(data, [buffer])
```

kullanılabilir.

---

# 16. CHUNK STREAMING

Dünyanın tamamını bir kerede üretme.

Oyuncunun yakınındaki chunk'ları yükle.

Örneğin başlangıç render distance:

```text
4 chunk
```

olabilir.

Render distance config üzerinden değiştirilebilir olmalıdır.

Oyuncu hareket ettikçe:

```text
yakındaki chunk → load/generate

uzaktaki chunk → unload
```

yapılmalıdır.

---

# 17. CHUNK QUEUE

Oyuncu başka bir bölgeye geçtiğinde 50 chunk'ı aynı frame içerisinde generate edip FPS'i düşürme.

Chunk generation queue oluştur.

Bir frame veya belirli zaman içerisinde kontrollü sayıda chunk işlenmelidir.

Örneğin:

```text
urgent chunks
normal chunks
background chunks
```

gibi priority sistemi ileride eklenebilir.

Şimdilik oyuncuya en yakın chunk önce üretilebilir.

---

# 18. PLAYER

Oyuncu birinci şahıs kamera kullanacak.

Kontroller:

```text
W → ileri

S → geri

A → sola

D → sağa

Space → zıpla

Mouse → kamera

Shift → koş
```

Pointer Lock API kullanılabilir.

Mouse sensitivity config olmalıdır.

---

# 19. PLAYER PHYSICS

Oyuncu:

* voxel dünyanın içine girmemeli,
* yere basabilmeli,
* duvara çarpabilmeli,
* zıplayabilmeli,
* düşebilmelidir.

İlk aşamada:

```text
walk
jump
gravity
collision
```

yeterlidir.

Koşma eklenebilir.

Şimdilik:

* can,
* açlık,
* düşme hasarı

ekleme.

---

# 20. VOXEL COLLISION

Her voxel için ayrı Rapier collider oluşturmak yasaktır.

Bu performans açısından problem yaratabilir.

Collision sistemi chunk veya voxel grid mantığını kullanmalıdır.

Örneğin player character hareketi sırasında yakın voxel'lar kontrol edilebilir.

Alternatif olarak optimize edilmiş chunk collision sistemi oluşturulabilir.

Seçtiğin yaklaşımı uygulamadan önce bana kısa şekilde açıkla.

---

# 21. RAYCAST

Kamera merkezinden voxel raycast yapılmalıdır.

Oyuncu baktığı bloğu seçebilmelidir.

Ekranın ortasında küçük crosshair bulunmalıdır.

Seçilen voxel üzerinde wireframe highlight gösterilebilir.

Örneğin:

```text
baktığım blok

[STONE]
```

görsel olarak seçili olmalıdır.

---

# 22. BLOCK BREAK

Sol mouse click:

```text
seçili voxel → Air
```

olmalıdır.

Blok kırılınca:

ilgili chunk yeniden mesh edilmelidir.

Ancak chunk sınırındaki voxel kırıldıysa komşu chunk'ın mesh'inin de güncellenmesi gerekebilir.

Örneğin:

```text
localX == 0
```

ise sol komşu chunk etkilenebilir.

Bunu doğru uygula.

---

# 23. BLOCK PLACE

Sağ mouse click:

seçilen voxel'in temas edilen yüzünün yanına yeni blok koymalıdır.

Oyuncunun kendi collider'ının içine blok konulmasına izin verme.

Başlangıçta seçilebilir bloklar:

```text
Grass
Dirt
Stone
Sand
Wood
```

yeterlidir.

---

# 24. HOTBAR

Ekranın altında basit hotbar oluştur.

Örneğin:

```text
1 Grass
2 Dirt
3 Stone
4 Sand
5 Wood
```

Klavye:

```text
1
2
3
4
5
```

ile blok seçilebilmelidir.

Mouse wheel desteği de eklenebilir.

---

# 25. UI

İlk UI sade olmalıdır.

Gerekli öğeler:

```text
crosshair

FPS counter

player coordinates

selected block

hotbar

loaded chunk count
```

Debug bilgileri geliştirme sırasında görünür olabilir.

Debug HUD tek tuşla kapatılıp açılabilir.

Örneğin:

```text
F3
```

---

# 26. DEBUG MODU

Debug için:

```text
FPS

Position

Chunk coordinate

Local voxel coordinate

Loaded chunks

Triangles

Draw calls

Seed
```

gibi değerler gösterilebilir.

Three.js renderer info kullanılabilir.

---

# 27. CONFIG SİSTEMİ

Magic number kullanımından kaçın.

Merkezi config oluştur.

Örneğin:

```typescript
export const GAME_CONFIG = {

    world: {
        chunkSize: 16,
        renderDistance: 4,
        seed: 12345
    },

    player: {
        walkSpeed: 5,
        sprintSpeed: 8,
        jumpForce: 7,
        mouseSensitivity: 0.002
    }

};
```

Değerler daha sonra değiştirilebilir olmalıdır.

---

# 28. SAVE SİSTEMİ — GELECEĞE HAZIRLIK

Şimdilik gerçek database persistence yazma.

Ancak world data şu mantığa hazırlanmalıdır:

Base terrain:

```text
seed tarafından üretilir
```

User modifications:

```text
ayrı olarak tutulur
```

Yani dünya veritabanında komple milyonlarca voxel olarak saklanmayacaktır.

İleride:

```text
seed + modifications
```

yaklaşımı kullanılacaktır.

Örneğin:

```typescript
type BlockModification = {
    x: number;
    y: number;
    z: number;
    blockType: BlockType;
};
```

gibi bir yapı kullanılabilir.

---

# 29. MULTIPLAYER İÇİN GELECEĞE HAZIRLIK

Şimdilik multiplayer yazma.

Ancak önemli işlemleri doğrudan UI event'lerinin içine gömme.

Örneğin kötü:

```typescript
mouse.onclick = () => {
    worldArray[x][y][z] = 0;
};
```

yerine:

```typescript
world.setBlock(...)
```

gibi bir API kullan.

İleride aynı komut:

```text
Client
↓
Colyseus
↓
Server
↓
World
```

üzerinden çalışacaktır.

Bu yüzden world mutation işlemleri merkezi olmalıdır.

---

# 30. SERVER AUTHORITATIVE GELECEK MİMARİSİ

Multiplayer geldiğinde:

server authoritative olacaktır.

Client:

```text
input
request
visual prediction
```

yapacaktır.

Server:

```text
world state
player state
block mutations
validation
```

konusunda otorite olacaktır.

Client'ın keyfi şekilde:

```text
x = 100000
inventory = 999999
```

gibi state göndermesine izin verilmeyecektir.

Şimdilik bunu implement etme.

Sadece mimariyi bozacak client-only hacklerden kaçın.

---

# 31. İLK MULTIPLAYER HEDEFİ

İleride milestone kapsamında:

```text
2–8 player per world
```

destekleyeceğiz.

Oyuncu:

```text
Create World
```

dediğinde oda açılacak.

Örneğin:

```text
Room Code: 583921
```

Arkadaş:

```text
Join Room

583921
```

girerek aynı dünyaya bağlanabilecek.

Bu aşamada:

* player movement,
* player transform,
* block break,
* block place

senkronize olacaktır.

Fakat şu anda bunları yazma.

---

# 32. RECONNECT

Multiplayer aşamasında reconnect sistemi olacaktır.

Bağlantısı kısa süre kopan oyuncu tekrar aynı oturuma girebilmelidir.

Bu iş Colyseus üzerinden tasarlanacaktır.

Şimdilik yazma.

---

# 33. ROBOTİK SİSTEM — GELECEK

İleride oyuncular robot oluşturacak.

Robot parçaları:

```text
chassis

motor

wheel

battery

distance sensor

color sensor

light sensor

button

robot arm

gripper
```

gibi olabilir.

Şimdilik robot sistemi implement etme.

Ancak voxel engine'i sadece player-centric tasarlayıp sonradan world entity eklemeyi imkansız hale getirme.

Genel bir entity sistemi ileride eklenebilmelidir.

---

# 34. BLOCKLY — GELECEK

Robotlar Google Blockly ile programlanacak.

Örneğin:

```text
Başla

İleri git 5

Sağa dön 90°

Eğer mesafe < 2
    Dur
```

Blockly'nin oluşturduğu JavaScript'i server'da doğrudan execute etmeyeceğiz.

Kendi güvenli robot instruction formatımız olacak.

Örneğin:

```text
MOVE 5

TURN 90

WAIT 1000

IF_DISTANCE_LT 2

STOP
```

veya AST tabanlı sistem olabilir.

Şimdilik implement etme.

---

# 35. GAMEPLAY — GELECEK

İleriki milestone'larda:

```text
Creative Mode

Inventory

Crafting

Tools

Achievements

Missions

Teams

Mini Games

Robot Missions

Workshop Mode

Teacher Mode
```

eklenebilir.

Şimdilik bunları geliştirme.

---

# 36. ŞU ÖZELLİKLERİ BAŞLANGIÇTA EKLEME

Şu anda kesinlikle ekleme:

* survival
* health
* hunger
* mobs
* monsters
* animals
* farming
* redstone benzeri sistem
* vehicles
* NPC
* crafting tree
* weather
* 50 biome
* mobile controls
* voice chat
* public servers
* economy
* achievements
* login
* database
* robot
* Blockly
* multiplayer

Önce voxel engine.

---

# 37. TEST EDİLEBİLİRLİK

World coordinate utility'leri gibi saf fonksiyonlar unit test edilebilir olmalıdır.

Özellikle test et:

```text
world → chunk conversion

negative coordinates

local voxel coordinate

chunk key

block index

seed determinism
```

Test framework olarak gerektiğinde Vitest kullanılabilir.

---

# 38. ERROR HANDLING

Hataları sessizce yutma.

Özellikle:

```text
worker errors

chunk generation errors

invalid block coordinates

renderer initialization

Rapier initialization
```

için anlaşılır console error üret.

---

# 39. LOGGING

Geliştirme sırasında anlamlı log kullanılabilir.

Ancak console'u her frame spamleme.

Örneğin şunu yapma:

```typescript
console.log(player.position)
```

her frame.

---

# 40. PERFORMANCE HEDEFLERİ

Desktop Chrome için hedef:

```text
60 FPS
```

olmalıdır.

İlk prototype küçük dünyada bu hedefi sağlamalıdır.

Daha sonra render distance artırılarak test edilir.

Ana thread üzerinde uzun frame spike oluşmamasına çalış.

---

# 41. RENDER PERFORMANSI

Takip et:

```text
FPS

Draw calls

Triangles

Geometry count

Texture count
```

Gereksiz object allocation yapma.

Game loop içerisinde sürekli yeni:

```typescript
new Vector3()
new Matrix4()
new Quaternion()
```

oluşturmaktan kaçın.

Temporary reusable objects kullanılabilir.

---

# 42. GAME LOOP

Game loop yapısını ayır:

```text
input

physics/update

world streaming

render
```

Delta time doğru kullanılmalıdır.

Physics veya network için ileride fixed timestep eklenebilmelidir.

---

# 43. RESIZE

Canvas browser resize olduğunda düzgün çalışmalı.

Camera aspect ve renderer size güncellenmelidir.

Device pixel ratio konusunda performansı koru.

Örneğin sınırsız:

```typescript
window.devicePixelRatio
```

kullanmak yerine üst sınır konulabilir.

---

# 44. BROWSER HEDEFİ

İlk hedef:

```text
Desktop Chrome
```

olabilir.

Ancak standart web API kullan.

Gereksiz Chrome-only çözüm yazma.

Daha sonra:

```text
Firefox
Safari/WebKit
```

test edeceğiz.

---

# 45. CODE QUALITY

Şunlardan kaçın:

```text
God class

1000 satırlık Game.ts

everything in main.ts

global mutable variables

circular imports

copy-paste code

hardcoded paths

magic numbers
```

Sorumlulukları sınıflara/modüllere ayır.

Ancak overengineering de yapma.

İlk milestone için 150 farklı class üretme.

---

# 46. DOSYA İSİMLENDİRME

Tutarlı isimlendirme kullan.

Örneğin:

```text
Chunk.ts
VoxelWorld.ts
ChunkMesher.ts
WorldGenerator.ts
PlayerController.ts
InputManager.ts
Game.ts
BlockRegistry.ts
GameConfig.ts
```

---

# 47. BLOCK REGISTRY

Bloklarla ilgili bilgileri if/else zincirlerine dağıtma.

Block registry oluştur.

Örneğin:

```typescript
{
    id: BlockType.Grass,

    name: "Grass",

    solid: true,

    textures: {
        top: "...",
        side: "...",
        bottom: "..."
    }
}
```

gibi.

İleride buraya:

```text
transparent
collidable
breakTime
lightEmission
```

eklenebilir.

---

# 48. AIR

Air:

```text
block id = 0
```

olabilir.

Air için geometry oluşturma.

---

# 49. TRANSPARENT BLOCK GELECEĞİ

Leaves ve ileride water için transparent render gerekebilir.

İlk milestone'da alpha problemi çok zaman alırsa Leaves'i temporary opaque yapabilirsin.

Ancak block registry transparent özelliğini gelecekte destekleyebilecek yapıda olsun.

---

# 50. WORLD HEIGHT

Başlangıç için dünya height limitini config ile sınırla.

Örneğin:

```text
minY = -32

maxY = 96
```

gibi.

Değerler daha sonra değiştirilebilir.

Infinite vertical world yapmaya çalışma.

Horizontal world procedural olarak genişleyebilir.

---

# 51. SPAWN

Oyuncu:

```text
0, terrainHeight + 2, 0
```

civarında spawn olabilir.

Solid bloğun içinde spawn olmamalı.

Terrain generator üzerinden spawn yüksekliğini bul.

---

# 52. FIRST PLAYABLE MILESTONE

Şimdi SADECE aşağıdaki milestone'u geliştir.

# MILESTONE 01 — VOXEL ENGINE PLAYGROUND

Oyuncu browser açtığında:

1. Three.js sahnesi açılacak.

2. Seed tabanlı voxel terrain üretilecek.

3. Chunk sistemi çalışacak.

4. Oyuncunun çevresindeki chunk'lar yüklenecek.

5. Uzak chunk'lar unload edilecek.

6. Her voxel ayrı mesh olmayacak.

7. Sadece görünür voxel yüzleri render edilecek.

8. Texture atlas veya uygun tek-material sistemi kullanılacak.

9. Oyuncu WASD ile hareket edecek.

10. Mouse ile bakacak.

11. Space ile zıplayacak.

12. Gravity olacak.

13. Solid voxel'lara çarpacak.

14. Kamera merkezinden voxel seçilecek.

15. Crosshair olacak.

16. Seçilen voxel highlight edilecek.

17. Sol click ile blok kırılacak.

18. Sağ click ile blok konulacak.

19. Hotbar olacak.

20. 1–5 tuşlarıyla blok seçilecek.

21. F3 ile debug HUD açılıp kapanacak.

22. Debug HUD:

```text
FPS
XYZ
Chunk XYZ
Loaded Chunks
Triangles
Draw Calls
Seed
```

gösterecek.

23. Oyun browser resize ile bozulmayacak.

24. Kod modüler olacak.

25. `npm run dev` ile çalışacak.

---

# 53. MILESTONE 01'DE OLMAYACAKLAR

Milestone 01 içerisinde:

```text
multiplayer yok

database yok

save yok

login yok

robot yok

Blockly yok

inventory screen yok

crafting yok

enemy yok

animals yok

survival yok

health yok

hunger yok

day-night yok

water simulation yok

weather yok
```

---

# 54. GELİŞTİRME ŞEKLİN

Şimdi önce mevcut çalışma klasörünü incele.

Eğer proje boşsa gerekli yapıyı oluştur.

Eğer halihazırda dosyalar varsa silmeden önce analiz et.

---

# 55. ÇALIŞMA SIRAN

Aşağıdaki sırayı kullan:

## STEP 1

Repository ve mevcut dosyaları incele.

## STEP 2

Kısa bir architecture plan çıkar.

Bana sadece gerekli önemli kararları söyle.

Uzun teori anlatma.

## STEP 3

Gerekli npm package'larını belirle.

## STEP 4

Projeyi oluştur.

## STEP 5

Voxel data modelini oluştur.

## STEP 6

Chunk sistemini oluştur.

## STEP 7

Terrain generator oluştur.

## STEP 8

Chunk mesher oluştur.

## STEP 9

Three.js renderer entegrasyonu yap.

## STEP 10

Chunk streaming oluştur.

## STEP 11

Player movement oluştur.

## STEP 12

Collision oluştur.

## STEP 13

Voxel raycast oluştur.

## STEP 14

Block break/place oluştur.

## STEP 15

Hotbar ve debug HUD oluştur.

## STEP 16

Çalıştır.

## STEP 17

Build al.

## STEP 18

TypeScript hatalarını çöz.

## STEP 19

Runtime console hatalarını kontrol et.

## STEP 20

Milestone acceptance checklist'i doğrula.

---

# 56. HER BÜYÜK DEĞİŞİKLİKTEN SONRA

Şunları çalıştır:

```bash
npm run typecheck
```

varsa.

Sonra:

```bash
npm run build
```

çalıştır.

Test varsa:

```bash
npm test
```

çalıştır.

Build hatalarını bırakma.

---

# 57. BAĞIMLILIK KURALI

Gereksiz npm package yükleme.

Bir işi Three.js veya native browser API ile çözebiliyorsak ekstra 10 library ekleme.

Her dependency'nin sebebi olmalıdır.

---

# 58. ASSET KURALI

İlk aşamada internetten telifli Minecraft texture'ları indirme.

Minecraft assetlerini kullanma.

Kendi basit texture'larımızı üret veya placeholder pixel texture kullan.

Minecraft logo, karakter, texture veya isimlerini projeye gömme.

Bu proje Minecraft'ın birebir kopyası değildir.

---

# 59. TASARIM YÖNÜ

Görsel stil:

```text
temiz
canlı
çocuk dostu
modern
voxel
```

olabilir.

Ama şimdilik gameplay ve engine görsellikten önemlidir.

---

# 60. CODE COMMENTS

Her satırı yorumlama.

Ancak karmaşık algoritmaları açıklayan kısa yorumlar kullan.

Özellikle:

```text
chunk coordinate conversion

meshing

negative coordinate handling

raycast

collision
```

alanlarında açıklama faydalıdır.

---

# 61. README

README oluştur.

Şunları içersin:

```text
ROBİ BLOCKS

Requirements

Install

Run

Build

Controls

Architecture

Current milestone

Known limitations
```

---

# 62. CONTROLS README

Kontroller:

```text
WASD        Move

Mouse       Look

Space       Jump

Shift       Sprint

Left Click  Break Block

Right Click Place Block

1–5         Select Block

Mouse Wheel Change Block

F3          Debug HUD

ESC         Release Mouse
```

---

# 63. ACCEPTANCE TEST

Milestone 01 tamamlanmış sayılması için aşağıdakilerin hepsi çalışmalıdır:

* [ ] `npm install` çalışıyor
* [ ] `npm run dev` çalışıyor
* [ ] browser'da oyun açılıyor
* [ ] TypeScript compile error yok
* [ ] console'da kritik error yok
* [ ] procedural terrain görünüyor
* [ ] chunk sistemi gerçekten var
* [ ] her block ayrı Mesh değil
* [ ] oyuncu hareket ediyor
* [ ] mouse look çalışıyor
* [ ] gravity çalışıyor
* [ ] player zeminden geçmiyor
* [ ] player duvardan geçmiyor
* [ ] block selection çalışıyor
* [ ] sol click blok kırıyor
* [ ] sağ click blok koyuyor
* [ ] chunk boundary block update çalışıyor
* [ ] hotbar çalışıyor
* [ ] debug HUD çalışıyor
* [ ] render distance çalışıyor
* [ ] chunk unload çalışıyor
* [ ] seed deterministic
* [ ] negative world coordinates doğru
* [ ] build başarılı
* [ ] README mevcut

---

# 64. ÖNEMLİ: KENDİ KODUNU KONTROL ET

Bir sistemi yazdıktan sonra sadece:

> tamamlandı

deme.

Kendi implementasyonunu incele.

Özellikle şu hataları ara:

```text
bir voxel = bir mesh

her frame chunk rebuild

her frame terrain generation

chunk unload memory leak

duplicate geometry

duplicate material

incorrect negative coordinates

wrong chunk boundary update

player tunneling

right click player içine block

raycast off-by-one

huge object allocation in game loop
```

Bulursan düzelt.

---

# 65. PERFORMANS TESTİ

Milestone sonunda:

render distance 4 iken:

```text
loaded chunk sayısı

triangle count

draw call

FPS
```

değerlerini kontrol et.

Açık performans problemi varsa nedeni belirle ve düzelt.

---

# 66. BENİMLE İLETİŞİM ŞEKLİN

Kod yazarken her küçük dosya için benden izin isteme.

Makul teknik kararları kendin ver.

Ancak:

* framework değiştirmek,
* temel mimariyi değiştirmek,
* Three.js yerine başka engine geçirmek,
* Colyseus yerine başka multiplayer çözümü seçmek,
* Rapier'i tamamen kaldırmak,
* monorepo stratejisini değiştirmek

gibi büyük kararları kendin değiştirme.

---

# 67. HATA İLE KARŞILAŞIRSAN

Bir hata çıkarsa:

1. hata mesajını oku,

2. nedenini belirle,

3. ilgili kodu incele,

4. düzelt,

5. tekrar çalıştır.

İlk denemede vazgeçme.

---

# 68. GEÇİCİ ÇÖZÜMLER

Bir şey geçici ise kod içerisinde açıkça belirt:

```typescript
// TODO(Milestone 02): Replace with worker-based meshing
```

gibi.

Ancak TODO bırakarak temel fonksiyonları çalışmaz halde bırakma.

---

# 69. PROJE FELSEFESİ

Bu proje:

> hızlı demo çıkarıp atılacak bir prototype

değildir.

Uzun vadede gerçek bir multiplayer voxel + robotik platformuna dönüşecektir.

Bu nedenle:

```text
clean architecture

performance

maintainability

determinism

network-ready design
```

önemlidir.

Ancak premature overengineering yapma.

---

# 70. ŞİMDİ YAPMAN GEREKEN

Şimdi:

1. mevcut klasörü incele,

2. Milestone 01 için kısa implementation planı oluştur,

3. gerekli proje yapısını kur,

4. bağımlılıkları yükle,

5. voxel engine'i implement etmeye başla,

6. çalışan ilk sürümü tamamla,

7. build/test işlemlerini yap,

8. oluşan hataları çöz,

9. acceptance checklist'i kontrol et.

# Bana tekrar "başlayayım mı?" diye sorma.

Doğrudan çalışmaya başla.

Milestone kapsamının dışına çıkma.

Özellikle multiplayer, robot, crafting veya survival özelliklerine şu aşamada geçme.

İlk hedefimiz yalnızca:

# SAĞLAM, PERFORMANSLI VE GENİŞLETİLEBİLİR BİR VOXEL ENGINE PLAYGROUND.

Bunu tamamla.
