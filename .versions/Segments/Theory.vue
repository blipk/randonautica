<template>
    <Page actionBarHidden="true">
        <DockLayout stretchLastChild="true">
            <PDFView :src="FAQPDF" @onLoad="voidEvent"></PDFView>
        </DockLayout>
    </Page>
</template>
