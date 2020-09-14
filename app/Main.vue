<template>

    <Page class="page" id="main-page" actionBarHidden="true" @loaded="pageLoaded">
<!-- Top -->
        <StackLayout dock="top" height="430">
            <GridLayout rows="auto, 380, auto" columns="*">
                <GridLayout row="0" column="0" rows="auto" columns="*">
                    <Label row="0" column="0" text="This area will be for user gameplay profile"   color="#000080"/>
                </GridLayout>

                    <AbsoluteLayout row="1" col="0">
                        <GridLayout top="135" left="182" background="transparent" style="z-index: 1;">
                        <ActivityIndicator top="135" left="182" style="z-index: 1;"
                        :busy="processingFatumReq" :busyChange="voidEvent" color="purple"></ActivityIndicator>
                    <Progress value="50" maxValue="100" @valueChange="voidEvent" />
                        </GridLayout>

                    <Mapbox 
                        top="0" left="0"
                        width="100%" height="100%"
                        
                        :accessToken="MAPBOX_APIKEY"


                        mapStyle="traffic_day"
                        :latitude="userLocationMarker.lat"
                        :longitude="userLocationMarker.lng"

                        hideCompass="true"
                        zoomLevel="3"
                        showUserLocation="false"
                        disableZoom="false"
                        disableRotation="true"
                        disableScroll="false"
                        disableTilt="true"
                        @mapReady="onMapReady"

                        >
                    </Mapbox>

                    <GridLayout top="4" left="3"  rows="auto,auto,auto,auto,auto,auto,auto" columns="*">
                        <Button row="0" @tap="getUserLocation" class="locButton btn btn-primary btn-rounded-lg" style="margin: 1">Set Location</Button>
                    </GridLayout>

                    <GridLayout top="4" id="fatumButtons" @layoutChanged="repositionComponent($event, [-0.0001, 0], true)" rows="auto,auto,auto,auto,auto,auto,auto" columns="*">
                        <button row="1" @tap="reqFatumTask('getpseudo')" :isEnabled="!processingFatumReq"  class="fbutton btn btn-primary btn-rounded-lg">Pseudo Point</button>
                        <button row="2" @tap="reqFatumTask('getquantum')" :isEnabled="!processingFatumReq" class="fbutton btn btn-primary btn-rounded-lg">Qntum Point</button>
                        <Button row="3" @tap="reqFatumTask('getattractor')" :isEnabled="!processingFatumReq" class="fbutton btn btn-primary btn-rounded-lg">Attractor</Button>
                        <Button row="4" @tap="reqFatumTask('getvoid')" :isEnabled="!processingFatumReq" class="fbutton btn btn-primary btn-rounded-lg">Void</Button>
                        <button row="5" @tap="reqFatumTask('getpair')" :isEnabled="!processingFatumReq" class="fbutton btn btn-primary btn-rounded-lg">Pair</button>
                        <!--<button row="6" @tap="getQRNGData" class="fbutton btn btn-primary btn-rounded-lg">QRNG Data</button>-->
                    </GridLayout>
                </AbsoluteLayout>


                <StackLayout row="2" col="0" VerticalAlignment="bottom"> 
                    <GridLayout rows="auto" columns="*, 100%">
                        <Slider col="0" :value="this.radius" minValue="1000" maxValue="10000" @valueChange="updateRadius" />
                        <TextField #radiusTxtBox col="1"
                            :text='radius' 
                            secure="false"
                            keyboardType="number"
                            returnKeyType="done"
                            autocorrect="false"
                            maxLength="5"
                            @returnPress="checkRadiusInput"
                            class="input input-border"></TextField>
                            <!-- @textChange="checkRadiusInput"
                            @focus="checkRadiusInput" 
                            @blur="checkRadiusInput" -->
                    </GridLayout>
                </StackLayout>
            </GridLayout>
        </StackLayout>
        <!-- /Top -->

        <!-- Bottom -->
        <StackLayout dock="bottom"> 
            <StackLayout>
                <GridLayout rows="auto" columns="auto,*,auto" height="50">
                    <Button col="0" text="" class="camera-button" @tap="voidEvent" />
                    <!--<TextField col="1" v-model="textFieldValue" hint="Enter message for log..." />-->
                    <Button col="2" text="Send" @tap="$routeToModal('Dialog')" /> 
                </GridLayout>
            </StackLayout>
            <StackLayout backgroundColor="#000">
                    <SegmentedBar :items="pageItems" :selectedIndex="mainSegmentIndex"
                    @selectedIndexChange="onSegmentIndexChange" class="menuSegments vc hc tc" 
                    selectedBackgroundColor="#FF0000" backgroundColor="#000">

                    </SegmentedBar>
            </StackLayout>
        </StackLayout>
        <!-- /Bottom -->


        <!-- Middle -->
        <StackLayout orientation="vertical">

        </StackLayout>
        <!-- /Middle -->
    </Page>
    </template>