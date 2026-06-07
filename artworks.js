const IMAGE_BASE_PATH = "image%20folder/";
const imagePath = (fileName) => `${IMAGE_BASE_PATH}${fileName}`;

window.DONGMIN_ARTWORKS = [
    {
        title: "장생포 고래 조형물",
        location: "장생포 고래박물관 근처",
        description: "고래의 꿈 분수대에 설치된 화강암 조형물",
        coverImage: imagePath("thumb/dongmin_whale.webp"),
        images: [
            imagePath("dongmin_whale.jpg"),
            imagePath("dm_whale/dm_whale_100.jpg"),
            imagePath("dm_whale/dm_whale_101.jpg"),
            imagePath("dm_whale/dm_whale_102.jpg"),
            imagePath("dm_whale/dm_whale_103.jpg"),
            imagePath("dm_whale/dm_whale_201.jpg"),
            imagePath("dm_whale/dm_whale_202.jpg"),
            imagePath("dm_whale/dm_whale_203.jpg"),
            imagePath("dm_whale/dm_whale_204.jpg"),
            imagePath("dm_whale/dm_whale_205.jpg"),
            imagePath("dm_whale/dm_whale_300.jpg"),
            imagePath("dm_whale/dm_whale_301.jpg"),
            imagePath("dm_whale/dm_whale_302.jpg"),
            imagePath("dm_whale/dm_whale_303.jpg"),
            imagePath("dm_whale/dm_whale_304.jpg"),
            imagePath("dm_whale/dm_whale_400.jpg"),
            imagePath("dm_whale/dm_whale_401.jpg"),
            imagePath("dm_whale/dm_whale_402.jpg"),
            imagePath("dm_whale/dm_whale_500.jpg")
        ]
    },
    {
        title: "윤흥신 장군상 좌대, 배경",
        location: "부산 동구 윤흥신 장군상",
        description: "장군상의 무게감을 받쳐주는 대형 석재 좌대",
        coverImage: imagePath("thumb/dongmin_busan.webp"),
        images: [
            imagePath("dongmin_busan.jpg")
        ]
    },
    {
        title: "대구 남구 6.25 참전유공자 명비",
        location: "대구 낙동강 승전기념관",
        description: "대구 남구 6.25 참전유공자를 기리는 석재 명비",
        coverImage: imagePath("thumb/dm_625.webp"),
        images: [
            imagePath("dm_625.jpg")
        ]
    },
    {
        title: "국민보도연맹사건 희생자 위령비",
        location: "경남 산청",
        description: "희생자들의 이름과 기억을 새긴 위령비",
        coverImage: imagePath("thumb/dongmin_sanch.webp"),
        images: [
            imagePath("dongmin_sanch.jpg")
        ]
    },
    {
        title: "제주 현지사 설법당 외벽",
        location: "제주 현지사 설법당",
        description: "제주 현지사 설법당의 외벽을 석재로 조성한 사례",
        coverImage: imagePath("thumb/dm_jeju.webp"),
        images: [
            imagePath("add/dm_jeju.jpg"),
            imagePath("add/dm_jeju1.jpg")
        ]
    },
    {
        title: "임업기술실용화센터 표지석",
        location: "대전광역시 유성구",
        description: "여러 색감의 석재가 조화된 기관 표지석",
        coverImage: imagePath("thumb/dongmin_block.webp"),
        images: [
            imagePath("dongmin_block.jpg")
        ]
    },
    {
        title: "남사예담촌 표지석",
        location: "경남 산청군 남사예담촌",
        description: "마을의 정체성과 결을 담은 석재 표지석",
        coverImage: imagePath("thumb/dongmin_namsa.webp"),
        images: [
            imagePath("dongmin_namsa.jpg")
        ]
    },
    {
        title: "석조미륵보살입상 복각",
        location: "동민조형석재",
        description: "부여 대조사 석조미륵보살입상을 바탕으로 한 복각 작업",
        coverImage: imagePath("thumb/dongmin_budd.webp"),
        images: [
            imagePath("dongmin_budd.jpg"),
            imagePath("add/dm_buddd.jpg")
        ]
    },
    {
        title: "석재 조각 아카이브",
        location: "동민조형석재",
        description: "제작 과정과 완성작을 함께 담은 조각 기록",
        coverImage: imagePath("thumb/dm_budd1.webp"),
        images: [
            imagePath("dm_budd1.jpg"),
            imagePath("dm_budd2.jpg"),
            imagePath("add/dm_budd2-1.jpg"),
            imagePath("dm_budd3.jpg"),
            imagePath("dm_31.jpg"),
            imagePath("dm_family.jpg"),
            imagePath("dm_xiamen.jpg"),
            imagePath("dongmin_bud.jpg"),
            imagePath("dm_mt.jpg"),
            imagePath("add/dm_gct.jpg"),
            imagePath("add/dm_sc1.jpg")
        ]
    }
];
